import {
  edges,
  placeById,
  places,
  foods,
  hotels,
  modeNames,
  railFare,
  railLineById,
  type Point,
  type Mode,
  type StoredMode,
  type Personality,
  type Place,
  type Food,
} from "./travel-data";
export const HOUR = 3600000,
  DAY = 24 * HOUR;
export type Category =
  | "transport"
  | "food"
  | "stay"
  | "sightseeing"
  | "letter"
  | "funding";
export type Entry = {
  id: string;
  time: number;
  day: number;
  placeId: string;
  category: Category;
  title: string;
  text: string;
  amount: number;
  balance: number;
  image?: string;
};
export type Leg = {
  points: Point[];
  mode: StoredMode;
  minutes: number;
  cost: number;
  km: number;
  lineId?: string;
};
export type Activity = {
  kind: "welcome" | "move" | "visit" | "meal" | "sleep" | "rest" | "complete";
  from: string;
  to: string;
  start: number;
  end: number;
  legs: Leg[];
  returning?: boolean;
  pendingVisit?: boolean;
  label: string;
};
export type Trip = {
  id: string;
  days: number;
  dailyBudget: number;
  personality: Personality;
  startedAt: number;
  deadline: number;
  offsetMs: number;
  lastProcessedAt: number;
  rng: number;
  balance: number;
  totalBudget: number;
  placeId: string;
  status: "active" | "completed";
  activity: Activity;
  entries: Entry[];
  visited: string[];
  meals: string[];
  nights: string[];
  distanceKm: number;
  /** Coordinates already traveled by the character, kept for the map history. */
  routeHistory?: Point[];
  commands: string[];
  completedAt?: number;
  weather: "sunny";
};
export function distance(a: Point, b: Point) {
  const rad = Math.PI / 180,
    x = (b[1] - a[1]) * rad * Math.cos(((a[0] + b[0]) / 2) * rad),
    y = (b[0] - a[0]) * rad;
  return Math.sqrt(x * x + y * y) * 6371;
}
export function pathLength(points: Point[]) {
  return points.slice(1).reduce((n, p, i) => n + distance(points[i], p), 0);
}
function random(t: Trip) {
  t.rng = (Math.imul(t.rng, 1664525) + 1013904223) >>> 0;
  return t.rng / 4294967296;
}
const routeCache = new Map<string, Leg[]>();
export function getRoute(
  from: string,
  to: string,
  preference: Personality,
): Leg[] {
  if (from === to) return [];
  const cacheKey = `${from}:${to}:${preference}`,
    cached = routeCache.get(cacheKey);
  if (cached) return cached;
  const dist: Record<string, number> = { [from]: 0 },
    previous: Record<string, { id: string; leg: Leg }> = {},
    seen = new Set<string>();
  while (true) {
    const node = Object.keys(dist)
      .filter((k) => !seen.has(k))
      .sort((a, b) => dist[a] - dist[b])[0];
    if (!node || node === to) break;
    seen.add(node);
    for (const e of edges) {
      if (e.a !== node && e.b !== node) continue;
      const next = e.a === node ? e.b : e.a,
        points = e.a === node ? e.points : [...e.points].reverse(),
        km = pathLength(points),
        mode: Mode = e.mode,
        cost = e.cost ?? (mode === "walk" ? 0 : Math.ceil((170 + km * 22) / 10) * 10),
        minutes = e.minutes ?? (mode === "walk" ? (km / 4) * 60 : (km / 32) * 60 + 9),
        weight =
          minutes +
          (preference === "frugal" ? cost / 12 : 0) -
          (preference === "rail" && mode === "train" ? 3 : 0);
      const leg = { points, mode, cost, minutes, km, lineId: e.lineId };
      if (dist[next] === undefined || dist[node] + weight < dist[next]) {
        dist[next] = dist[node] + weight;
        previous[next] = { id: node, leg };
      }
    }
  }
  if (!previous[to]) throw new Error("経路がありません");
  const result: Leg[] = [];
  for (let node = to; node !== from; node = previous[node].id)
    result.unshift(previous[node].leg);
  routeCache.set(cacheKey, result);
  return result;
}
export function routeCost(legs: Leg[]) {
  let total = 0,
    operator: "subway" | "jr" | "nishitetsu" | null = null,
    trainKm = 0;
  const flushTrain = () => {
    if (operator) total += railFare(trainKm, operator);
    operator = null;
    trainKm = 0;
  };
  for (const leg of legs) {
    const line = leg.lineId ? railLineById[leg.lineId] : undefined;
    if (leg.mode === "train" && line) {
      if (operator && operator !== line.operator) flushTrain();
      operator = line.operator;
      trainKm += leg.km;
    } else {
      flushTrain();
      total += leg.cost;
    }
  }
  flushTrain();
  return total;
}
export const routeMinutes = (legs: Leg[]) =>
  legs.reduce((a, b) => a + b.minutes, 0);
export function jstStart(ms: number) {
  return Math.floor((ms + 9 * HOUR) / DAY) * DAY - 9 * HOUR;
}
function dateKey(ms: number) {
  return new Date(ms + 9 * HOUR).toISOString().slice(0, 10);
}
export function tripDay(t: Trip, at: number) {
  return Math.min(
    t.days,
    Math.max(1, Math.floor((at - t.startedAt) / DAY) + 1),
  );
}
function visitWindow(p: Place, at: number) {
  const dayStart = jstStart(at),
    openAt = dayStart + p.openHour * HOUR,
    closeAt = dayStart + p.closeHour * HOUR;
  return at >= openAt && at + p.minutes * 60000 <= closeAt;
}
function foodWindow(f: Food, at: number) {
  const minutes = (at - jstStart(at)) / 60000,
    open = f.openHour * 60,
    close = f.closeHour * 60;
  return open < close
    ? minutes >= open && minutes < close
    : minutes >= open || minutes < close;
}
function nextVisitOpen(p: Place, at: number) {
  const dayStart = jstStart(at),
    openAt = dayStart + p.openHour * HOUR,
    closeAt = dayStart + p.closeHour * HOUR;
  if (at < openAt) return openAt;
  if (at + p.minutes * 60000 <= closeAt) return at;
  return openAt + DAY;
}
function record(
  t: Trip,
  at: number,
  category: Category,
  title: string,
  text: string,
  amount = 0,
  image?: string,
) {
  if (amount > t.balance) throw new Error("予算不足");
  t.balance -= amount;
  const entry: Entry = {
    id: `${t.id}:${t.entries.length}`,
    time: at,
    day: tripDay(t, at),
    placeId: t.placeId,
    category,
    title,
    text,
    amount,
    balance: t.balance,
    ...(image ? { image } : {}),
  };
  t.entries.push(entry);
}
function minimumPaidHotelCost() {
  const prices = hotels
    .filter((hotel) => hotel.price > 0)
    .map((hotel) => hotel.price);
  return prices.length ? Math.min(...prices) : 0;
}
export function reserve(t: Trip, at: number, place = t.placeId) {
  let amount = routeCost(getRoute(place, "hakata", t.personality));
  for (let date = jstStart(at); date < t.deadline; date += DAY) {
    for (const hour of [8, 12, 18, 23]) {
      const when = date + hour * HOUR,
        key = dateKey(date);
      if (when < at || when >= t.deadline) continue;
      if (hour === 23) {
        if (!t.nights.includes(key)) amount += minimumPaidHotelCost();
      } else {
        const slot =
          hour === 8 ? "breakfast" : hour === 12 ? "lunch" : "dinner";
        if (!t.meals.includes(`${key}:${slot}`)) amount += 350;
      }
    }
  }
  return amount;
}
function idleActivity(
  t: Trip,
  kind: Activity["kind"],
  at: number,
  duration: number,
  label: string,
): Activity {
  return {
    kind,
    from: t.placeId,
    to: t.placeId,
    start: at,
    end: at + duration,
    legs: [],
    label,
  };
}
function waitForVisit(t: Trip, at: number) {
  const p = placeById[t.placeId],
    openAt = nextVisitOpen(p, at),
    returnMinutes = routeMinutes(getRoute(p.id, "hakata", t.personality));
  if (
    openAt + p.minutes * 60000 + returnMinutes * 60000 + HOUR >=
    t.deadline
  ) {
    beginMove(t, "hakata", at, true);
    return;
  }
  const activity = idleActivity(
    t,
    "rest",
    at,
    Math.max(60000, openAt - at),
    `${p.name}が開くまで、ひと休み`,
  );
  activity.pendingVisit = true;
  t.activity = activity;
}
function finish(t: Trip, at: number) {
  t.status = "completed";
  t.completedAt = at;
  t.placeId = "hakata";
  t.activity = idleActivity(t, "complete", at, 0, "博多に帰ってきたよ");
  record(
    t,
    at,
    "letter",
    "ただいま。旅をさせてくれて、ありがとう。",
    "リュックの中に、思い出がいっぱい。あなたのおかげで、すてきな旅になりました。また、どこかへ行こうね。",
    0,
    "komugi",
  );
}
function beginMove(t: Trip, to: string, at: number, returning = false) {
  const legs = getRoute(t.placeId, to, t.personality);
  if (!legs.length) {
    if (returning) finish(t, at);
    return;
  }
  const cost = routeCost(legs),
    minutes = Math.ceil(routeMinutes(legs)),
    modes = [...new Set(legs.map((l) => modeNames[l.mode]))].join("・");
  record(
    t,
    at,
    "transport",
    returning
      ? "思い出を連れて、博多へ。"
      : `${placeById[to].area}へ行ってみるね。`,
    returning
      ? `所要約${minutes}分・運賃${cost}円。帰りのお金は、ちゃんと残しておいたよ。リュックを背負って、最後の移動。`
      : `${modes}で${placeById[to].name}へ（所要約${minutes}分・運賃${cost}円）。${t.personality === "frugal" ? "おこづかいを大事にしながら、寄り道を楽しむよ。" : t.personality === "rail" ? "車窓の景色も楽しみなんだ。" : t.personality === "cyclist" ? "海辺の道があると、うれしくなるね。" : "向こうには、どんな景色が待っているかな。"}`,
    cost,
  );
  t.activity = {
    kind: "move",
    from: t.placeId,
    to,
    start: at,
    end: at + Math.ceil(routeMinutes(legs) * 60000),
    legs,
    returning,
    label: `${placeById[to].name}へ${returning ? "帰る" : "移動中"}`,
  };
}
function appendRouteHistory(t: Trip, activity: Activity) {
  const history = t.routeHistory ?? [placeById[activity.from].point];
  for (const leg of activity.legs) {
    for (const point of leg.points) {
      const last = history[history.length - 1];
      if (!last || last[0] !== point[0] || last[1] !== point[1]) {
        history.push(point);
      }
    }
  }
  t.routeHistory = history;
}
function visit(t: Trip, at: number) {
  const p = placeById[t.placeId];
  if (!t.visited.includes(p.id)) t.visited.push(p.id);
  const affordable = p.price <= t.balance - reserve(t, at);
  record(
    t,
    at,
    "sightseeing",
    affordable ? `${p.name}に着いたよ。` : "今日は、近くをのんびり散歩。",
    affordable
      ? p.diary
      : "残りのおこづかいを考えて、入場はまた今度。外を歩くだけでも、発見はいっぱいだね。",
    affordable ? p.price : 0,
    affordable ? p.image : undefined,
  );
  t.activity = idleActivity(
    t,
    "visit",
    at,
    p.minutes * 60000,
    p.category === "sea" ? "海を眺めて、ひと休み" : `${p.name}をおさんぽ`,
  );
}
function decide(t: Trip, at: number) {
  const home = getRoute(t.placeId, "hakata", t.personality),
    backMs = routeMinutes(home) * 60000;
  if (at + backMs + 2 * HOUR >= t.deadline) {
    beginMove(t, "hakata", at, true);
    return;
  }
  const hour = new Date(at + 9 * HOUR).getUTCHours(),
    key = dateKey(at);
  const nightKey = hour < 7 ? dateKey(at - DAY) : key;
  const slot =
    hour >= 7 && hour < 11
      ? "breakfast"
      : hour >= 11 && hour < 15
        ? "lunch"
        : hour >= 17 && hour < 24
          ? "dinner"
          : null;
  if (slot && !t.meals.includes(`${key}:${slot}`)) {
    const free = t.balance - reserve(t, at);
    let candidates = foods.filter(
      (f) =>
        f.slots.includes(slot) &&
        foodWindow(f, at) &&
        f.price <= free,
    );
    if (!candidates.length)
      candidates = foods.filter(
        (f) =>
          f.slots.includes(slot) &&
          foodWindow(f, at) &&
          f.price === 350 &&
          f.price <= t.balance - routeCost(home),
      );
    if (candidates.length) {
      t.meals.push(`${key}:${slot}`);
      const late = hour >= 21 || hour < 7;
      const lateOpenBonus = late ? 24 : 0;
      const weighted = candidates
        .map((f) => ({
          f,
          score:
            random(t) * 35 +
            (f.preference.includes(t.personality) ? 40 : 0) -
            Math.max(0, -Math.log(f.weight) * 24) -
            (t.personality === "frugal" ? f.price / 20 : 0) -
            (t.entries.some((e) => e.title === `${f.name}、いただきます。`)
              ? 25
              : 0) +
            (f.closeHour >= 24 ? lateOpenBonus : 0),
        }))
        .sort((a, b) => b.score - a.score);
      const f = weighted[0].f;
      record(
        t,
        at,
        "food",
        `${f.name}、いただきます。`,
        (free < 1200
          ? "帰り道と宿のお金を残して、今日はお手頃なごはん。"
          : "") + f.diary,
        f.price,
        f.image,
      );
      t.activity = idleActivity(
        t,
        "meal",
        at,
        45 * 60000,
        `${f.name}を食べているよ`,
      );
      return;
    }
  }
  if ((hour >= 23 || hour < 7) && !t.nights.includes(nightKey)) {
    t.nights.push(nightKey);
    const available = t.balance - reserve(t, at);
    const paidChoices = hotels.filter(
      (hotel) => hotel.price > 0 && hotel.price <= available,
    );
    const camping = hotels.find((hotel) => hotel.price === 0) ?? hotels[0];
    const choices = paidChoices.length ? paidChoices : [camping];
    const hotel =
      t.personality === "frugal"
        ? choices[0]
        : choices[Math.floor(random(t) * Math.min(choices.length, 3))];
    // Keep the cheapest paid lodging in reserve; switch to the zero-cost fallback when needed.
    const campingText = hotel.price === 0;
    record(
      t,
      at,
      "stay",
      campingText ? "野宿で、おやすみ。" : `${hotel.name}で、おやすみ。`,
      campingText
        ? "宿代を残せなかったので、静かで安全な場所を探して休むことにしたよ。明日は少し節約しよう。"
        : "今日もたくさん歩いたなあ。リュックを置いて、ふかふかのお布団へ。明日はどこへ行こうかな。",
      hotel.price,
    );
    let wake = jstStart(at) + 7.5 * HOUR;
    if (wake <= at) wake += DAY;
    t.activity = idleActivity(
      t,
      "sleep",
      at,
      Math.max(60000, Math.min(wake, t.deadline - backMs - 2 * HOUR) - at),
      "宿で、すやすや",
    );
    return;
  }
  const candidates = places
    .filter((p) => p.id !== t.placeId && p.id !== "hakata")
    .map((p) => {
      const legs = getRoute(t.placeId, p.id, t.personality),
        cost = routeCost(legs) + p.price,
        minutes = routeMinutes(legs);
      return {
        p,
        legs,
        cost,
        minutes,
        arrivalAt: at + Math.ceil(minutes * 60000),
        score:
          random(t) * 40 +
          (t.visited.includes(p.id) ? -55 : 25) +
          (t.personality === "cyclist" && p.category === "sea" ? 30 : 0) +
          (t.personality === "foodie" && p.category === "city" ? 12 : 0) +
          (t.personality === "rail" && legs.some((l) => l.mode === "train")
            ? 20
            : 0) -
          minutes * 0.22 -
          (t.personality === "frugal" ? cost / 15 : cost / 80),
      };
    })
    .filter(
      (c) =>
        visitWindow(c.p, c.arrivalAt) &&
        c.cost <= t.balance - reserve(t, at, c.p.id) &&
        c.arrivalAt +
          (c.p.minutes +
            routeMinutes(getRoute(c.p.id, "hakata", t.personality))) *
            60000 +
          HOUR <
          t.deadline,
    )
    .sort((a, b) => b.score - a.score);
  if (candidates.length) {
    beginMove(t, candidates[0].p.id, at);
    return;
  }
  record(
    t,
    at,
    "letter",
    "ベンチで、ちょっとひと休み。",
    "残りのおこづかいを数えて、今日はゆっくり。何もしない時間も、旅のうちだね。",
  );
  t.activity = idleActivity(t, "rest", at, HOUR, "近くのベンチで、ひと休み");
}
export function createTrip(
  id: string,
  days: number,
  dailyBudget: number,
  personality: Personality,
  now: number,
  seed: number,
): Trip {
  const t: Trip = {
    id,
    days,
    dailyBudget,
    personality,
    startedAt: now,
    deadline: now + days * DAY,
    offsetMs: 0,
    lastProcessedAt: now,
    rng: seed >>> 0,
    balance: days * dailyBudget,
    totalBudget: days * dailyBudget,
    placeId: "hakata",
    status: "active",
    activity: {
      kind: "welcome",
      from: "hakata",
      to: "hakata",
      start: now,
      end: now + 5 * 60000,
      legs: [],
      label: "博多駅で、旅じたく",
    },
    entries: [],
    visited: [],
    meals: [],
    nights: [],
    distanceKm: 0,
    routeHistory: [placeById.hakata.point],
    commands: [],
    weather: "sunny",
  };
  record(
    t,
    now,
    "letter",
    "いってきます。",
    "おこづかい、ありがとう。行き先はまだ内緒。小さなリュックと、わくわくを連れて行ってくるね。",
  );
  return t;
}
export function advance(t: Trip, now: number) {
  const until = Math.max(t.lastProcessedAt, Math.min(now, t.deadline + DAY));
  let loops = 0;
  while (t.status === "active" && t.activity.end <= until) {
    if (++loops > 1000) throw new Error("旅の進行が多すぎます");
    const at = t.activity.end,
      activity = t.activity;
    t.lastProcessedAt = at;
    if (activity.kind === "welcome") {
      record(
        t,
        at,
        "letter",
        "旅のはじまりに、はいチーズ。",
        "博多に着いた記念の一枚。バンダナ、曲がっていないかな？これから、自分の足で福岡を探検してくるね。",
        0,
        "komugi",
      );
      decide(t, at);
    } else if (activity.kind === "move") {
      t.distanceKm += activity.legs.reduce((n, l) => n + l.km, 0);
      appendRouteHistory(t, activity);
      t.placeId = activity.to;
      if (activity.returning) finish(t, at);
      else if (visitWindow(placeById[t.placeId], at)) visit(t, at);
      else waitForVisit(t, at);
    } else if (activity.pendingVisit) visit(t, at);
    else decide(t, at);
    if (t.status === "active" && t.activity.end <= at)
      throw new Error("旅の時刻が進みません");
  }
  t.lastProcessedAt = until;
  return t;
}
export function currentPosition(t: Trip, now: number): Point {
  if (t.activity.kind !== "move") return placeById[t.placeId].point;
  let elapsed = Math.max(0, now - t.activity.start) / 60000;
  for (const leg of t.activity.legs) {
    if (elapsed > leg.minutes) {
      elapsed -= leg.minutes;
      continue;
    }
    const total = pathLength(leg.points),
      target = total * Math.min(1, elapsed / leg.minutes);
    let walked = 0;
    for (let i = 1; i < leg.points.length; i++) {
      const d = distance(leg.points[i - 1], leg.points[i]);
      if (walked + d >= target) {
        const ratio = d ? (target - walked) / d : 0,
          a = leg.points[i - 1],
          b = leg.points[i];
        return [a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio];
      }
      walked += d;
    }
    return leg.points[leg.points.length - 1];
  }
  return placeById[t.activity.to].point;
}
export function fund(t: Trip, amount: number, requestId: string, at: number) {
  if (t.commands.includes(requestId)) return;
  t.commands.push(requestId);
  t.totalBudget += amount;
  record(
    t,
    at,
    "funding",
    "おこづかい、受け取ったよ。",
    "ありがとう！これで少し、寄り道できるかも。大事に使うね。",
    -amount,
  );
}
