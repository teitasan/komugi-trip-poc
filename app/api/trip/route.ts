import { z } from "zod";
import { database } from "@/db/store";
import {
  advance,
  createTrip,
  fund,
  reserve,
  HOUR,
  type Trip,
} from "@/lib/simulation";
export const dynamic = "force-dynamic";
const commandSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("start"),
    requestId: z.string().uuid(),
    tripId: z.string().uuid().optional(),
    days: z.union([z.literal(3), z.literal(7)]),
    dailyBudget: z.number().int().min(7000).max(30000),
    personality: z.enum(["foodie", "frugal", "rail", "cyclist"]),
  }),
  z.object({
    action: z.literal("advance"),
    requestId: z.string().uuid(),
    tripId: z.string().uuid(),
    hours: z.union([z.literal(1), z.literal(6), z.literal(24)]),
  }),
  z.object({
    action: z.literal("fund"),
    requestId: z.string().uuid(),
    tripId: z.string().uuid(),
    amount: z.union([z.literal(1000), z.literal(3000), z.literal(5000)]),
  }),
]);
interface Row {
  id: string;
  state: string;
  version: number;
  status: string;
  created_at: number;
}
class RequestError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
function identity(req: Request) {
  const match = req.headers
    .get("cookie")
    ?.match(/(?:^|;\s*)komugi_sponsor=([a-f0-9]{64})(?:;|$)/);
  return (
    match?.[1] ??
    Array.from(crypto.getRandomValues(new Uint8Array(32)), (n) =>
      n.toString(16).padStart(2, "0"),
    ).join("")
  );
}
function reply(req: Request, owner: string, data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Set-Cookie": `komugi_sponsor=${owner}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${new URL(req.url).protocol === "https:" ? "; Secure" : ""}`,
    },
  });
}
async function fetchRow(owner: string, id?: string) {
  const db = database();
  return id
    ? db
        .prepare(
          "SELECT id,state,version,status,created_at FROM trips WHERE owner=? AND id=?",
        )
        .bind(owner, id)
        .first<Row>()
    : db
        .prepare(
          "SELECT id,state,version,status,created_at FROM trips WHERE owner=? ORDER BY created_at DESC LIMIT 1",
        )
        .bind(owner)
        .first<Row>();
}
async function payload(owner: string, t: Trip | null) {
  const history = await database()
    .prepare(
      "SELECT id,created_at,status FROM trips WHERE owner=? ORDER BY created_at DESC LIMIT 30",
    )
    .bind(owner)
    .all();
  const now = Date.now() + (t?.offsetMs ?? 0);
  return {
    trip: t,
    now,
    reserve: t && t.status === "active" ? reserve(t, now) : 0,
    history: history.results,
  };
}
async function update(
  owner: string,
  id: string | undefined,
  mutate?: (t: Trip, now: number) => void,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const row = await fetchRow(owner, id);
    if (!row) return null;
    const t = JSON.parse(row.state) as Trip;
    advance(t, Date.now() + t.offsetMs);
    if (mutate) mutate(t, Date.now() + t.offsetMs);
    const result = await database()
      .prepare(
        "UPDATE trips SET state=?,status=?,version=version+1 WHERE id=? AND owner=? AND version=?",
      )
      .bind(JSON.stringify(t), t.status, t.id, owner, row.version)
      .run();
    if (result.meta.changes === 1) return t;
  }
  throw new RequestError(
    "旅の記録を更新中です。少し待って、もう一度お試しください。",
    409,
  );
}
function handleError(req: Request, owner: string, e: unknown) {
  if (e instanceof RequestError)
    return reply(req, owner, { error: e.message }, e.status);
  console.error("Trip storage or simulation failure", e);
  return reply(
    req,
    owner,
    {
      error:
        "旅の記録を読み書きできませんでした。入力はそのままで、もう一度お試しください。",
    },
    503,
  );
}
export async function GET(req: Request) {
  const owner = identity(req);
  try {
    const id = new URL(req.url).searchParams.get("id") ?? undefined;
    if (id && !z.string().uuid().safeParse(id).success)
      throw new RequestError("旅が見つかりません。", 404);
    const t = await update(owner, id);
    return reply(req, owner, await payload(owner, t));
  } catch (e) {
    return handleError(req, owner, e);
  }
}
export async function POST(req: Request) {
  const owner = identity(req);
  try {
    const origin = req.headers.get("origin");
    if (origin && origin !== new URL(req.url).origin)
      throw new RequestError("この操作は旅の画面から行ってください。", 403);
    if (!req.headers.get("content-type")?.includes("application/json"))
      throw new RequestError("入力形式が正しくありません。");
    const raw = await req.json().catch(() => {
      throw new RequestError("入力を読み取れませんでした。");
    });
    const parsed = commandSchema.safeParse(raw);
    if (!parsed.success)
      throw new RequestError("日数・予算・性格・操作内容を確認してください。");
    const input = parsed.data;
    let t: Trip | null;
    if (input.action === "start") {
      const duplicate = await fetchRow(owner, input.requestId);
      if (duplicate)
        return reply(
          req,
          owner,
          await payload(owner, JSON.parse(duplicate.state)),
        );
      await update(owner, undefined);
      const active = await database()
        .prepare("SELECT id FROM trips WHERE owner=? AND status='active'")
        .bind(owner)
        .first();
      if (active)
        throw new RequestError(
          "こむぎは、いま旅の途中です。帰ってきたら次の旅に送り出せます。",
          409,
        );
      t = createTrip(
        input.requestId,
        input.days,
        input.dailyBudget,
        input.personality,
        Date.now(),
        crypto.getRandomValues(new Uint32Array(1))[0],
      );
      try {
        await database()
          .prepare(
            "INSERT INTO trips (id,owner,created_at,status,version,state) VALUES (?,?,?,'active',0,?)",
          )
          .bind(t.id, owner, t.startedAt, JSON.stringify(t))
          .run();
      } catch (e) {
        const existing = await fetchRow(owner, input.requestId);
        if (existing) t = JSON.parse(existing.state);
        else if (
          await database()
            .prepare("SELECT id FROM trips WHERE owner=? AND status='active'")
            .bind(owner)
            .first()
        )
          throw new RequestError(
            "別の操作で旅が始まりました。再読み込みして見守ってください。",
            409,
          );
        else throw e;
      }
    } else {
      t = await update(owner, input.tripId, (current, now) => {
        if (current.commands.includes(input.requestId)) return;
        if (current.status === "completed")
          throw new RequestError("この旅は終了しています。");
        if (input.action === "fund")
          fund(current, input.amount, input.requestId, now);
        else {
          current.commands.push(input.requestId);
          current.offsetMs += input.hours * HOUR;
          advance(current, Date.now() + current.offsetMs);
        }
      });
      if (!t) throw new RequestError("旅が見つかりません。", 404);
    }
    return reply(req, owner, await payload(owner, t));
  } catch (e) {
    return handleError(req, owner, e);
  }
}
