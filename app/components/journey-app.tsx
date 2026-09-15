"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  PawPrint,
  Map,
  Images,
  Wallet,
  Info,
  MapPin,
  Sun,
  TrainFront,
  ArrowUpRight,
  Send,
  MessageCircle,
  Heart,
  Footprints,
  Clock3,
  FastForward,
  Plus,
  Check,
  House,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent as BaseDialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import JourneyMap from "./journey-map";
import {
  currentPosition,
  tripDay,
  type Trip,
  type Entry,
  type Category,
} from "@/lib/simulation";
import {
  personalities,
  placeById,
  modeNames,
  type Personality,
} from "@/lib/travel-data";
const money = (n: number) => new Intl.NumberFormat("ja-JP").format(n);
const imageSrc = (image: string) =>
  `/images/${image.includes(".") ? image : `${image}.png`}`;
const duration = (ms: number) => {
  const minutes = Math.max(1, Math.ceil(ms / 60000));
  return minutes < 60
    ? `約${minutes}分`
    : `約${Math.floor(minutes / 60)}時間${minutes % 60 ? `${minutes % 60}分` : ""}`;
};
const time = (ms: number) =>
  new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(ms);
const date = (ms: number) =>
  new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "long",
    day: "numeric",
  }).format(ms);
const categories: Record<Category, string> = {
  transport: "交通",
  food: "ごはん",
  stay: "おやど",
  sightseeing: "観光",
  letter: "メッセージ",
  funding: "支給",
};
const categoryColors: Record<Category, string> = {
  transport: "#7fa3b5",
  food: "#eaa276",
  stay: "#b3acd2",
  sightseeing: "#9bb89c",
  letter: "#c6cbd2",
  funding: "#e9b86d",
};
function DialogContent({
  children,
  ...props
}: React.ComponentProps<typeof BaseDialogContent>) {
  return (
    <BaseDialogContent {...props} showCloseButton={false}>
      {children}
      <DialogClose className="dialog-close" aria-label="閉じる">
        ×
      </DialogClose>
    </BaseDialogContent>
  );
}
type Snapshot = {
  trip: Trip | null;
  now: number;
  reserve: number;
  history: { id: string; created_at: number; status: string }[];
};
function MessageCard({ entry, onClick }: { entry: Entry; onClick: () => void }) {
  return (
    <button
      className={`message-card ${entry.image ? "has-media" : "text-message"}`}
      onClick={onClick}
      aria-label={`${entry.title} メッセージを開く`}
    >
      <span className="message-avatar" aria-hidden="true">
        <img src="/images/komugi.png" alt="" />
      </span>
      <span className="message-body">
        <span className="message-meta">
          <strong>こむぎ</strong>
          <span>
            {placeById[entry.placeId].area} · {entry.day}日目 {time(entry.time)}
          </span>
        </span>
        <span className="message-bubble">
          {entry.image && (
            <span
              className={`message-image ${entry.image === "komugi" ? "portrait-photo" : ""}`}
            >
              <img
                src={imageSrc(entry.image)}
                alt={`${entry.title} こむぎの旅のイメージ写真`}
              />
              <span className="photo-tag">{categories[entry.category]}</span>
            </span>
          )}
          {!entry.image && (
            <span className="message-kind">
              <MessageCircle size={14} />
              {categories[entry.category]}
            </span>
          )}
          <span className="message-copy">
            <strong>{entry.title}</strong>
            <span>
              {entry.text.length > 90 ? entry.text.slice(0, 90) + "…" : entry.text}
            </span>
          </span>
          <span className="message-foot">
            <span>
              {entry.amount > 0
                ? `使ったお金 ¥${money(entry.amount)}`
                : "こむぎから"}
            </span>
            <span className="message-read">既読</span>
          </span>
        </span>
      </span>
      <ArrowUpRight className="message-open" aria-hidden="true" />
    </button>
  );
}
function SampleMessages() {
  return (
    <div className="message-thread message-thread-preview">
      {[
        {
          image: "coast",
          tag: "こんな旅が待っている",
          area: "海辺",
          title: "海の向こうには、なにがある？",
          text: "潮風と、波の音。のんびり寄り道。",
        },
        {
          image: "ramen",
          tag: "おいしい寄り道",
          area: "ご当地ごはん",
          title: "おなかも、心も、いっぱい。",
          text: "次はなにを食べようかな。",
        },
      ].map((p) => (
        <article className="sample-message" key={p.image}>
          <div className="message-avatar" aria-hidden="true">
            <img src="/images/komugi.png" alt="" />
          </div>
          <div className="message-body">
            <div className="message-meta">
              <strong>こむぎ</strong>
              <span>福岡 · 旅のイメージ</span>
            </div>
            <div className="message-bubble">
              <div className="message-image">
                <img src={imageSrc(p.image)} alt={`${p.title} 旅のイメージ`} />
                <span className="photo-tag">{p.tag}</span>
              </div>
              <div className="message-copy">
                <strong>{p.title}</strong>
                <span>{p.text}</span>
              </div>
              <div className="message-foot">
                <span>こむぎから</span>
                <span className="message-read">旅の予告</span>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
export default function JourneyApp() {
  const [tab, setTab] = useState("map"),
    [setup, setSetup] = useState(false),
    [about, setAbout] = useState(false),
    [sponsor, setSponsor] = useState(false),
    [detail, setDetail] = useState<Entry | null>(null);
  const [days, setDays] = useState(3),
    [daily, setDaily] = useState("10000"),
    [personality, setPersonality] = useState<Personality>("foodie"),
    [funding, setFunding] = useState(3000);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [clock, setClock] = useState(Date.now()),
    [dayFilter, setDayFilter] = useState(0);
  const viewId = useRef<string | undefined>(undefined),
    mutating = useRef(false),
    sequence = useRef(0),
    clockBase = useRef({ server: Date.now(), client: Date.now() }),
    pending = useRef<{ key: string; id: string } | null>(null),
    stateRef = useRef<Snapshot | null>(null);
  const apply = useCallback((data: Snapshot) => {
    stateRef.current = data;
    setSnapshot(data);
    clockBase.current = { server: data.now, client: Date.now() };
    setClock(data.now);
  }, []);
  const refresh = useCallback(
    async (id = viewId.current) => {
      if (mutating.current) return;
      const seq = ++sequence.current;
      try {
        const response = await fetch(
          `/api/trip${id ? `?id=${encodeURIComponent(id)}` : ""}`,
          { cache: "no-store" },
        );
        const data = (await response.json()) as Snapshot & { error?: string };
        if (!response.ok) throw new Error(data.error);
        if (seq !== sequence.current) return;
        apply(data);
        setError("");
      } catch (e) {
        if (seq === sequence.current)
          setError(
            e instanceof Error ? e.message : "旅の記録を読み込めませんでした。",
          );
      } finally {
        setLoading(false);
      }
    },
    [apply],
  );
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 30000);
    const tick = setInterval(
      () =>
        setClock(
          clockBase.current.server + Date.now() - clockBase.current.client,
        ),
      1000,
    );
    const visible = () => {
      if (!document.hidden) void refresh();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearInterval(timer);
      clearInterval(tick);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [refresh]);
  const mutate = useCallback(
    async (action: string, values: Record<string, unknown> = {}) => {
      if (mutating.current) return null;
      mutating.current = true;
      setBusy(true);
      setError("");
      sequence.current++;
      const tripId = stateRef.current?.trip?.id,
        key = JSON.stringify({ action, tripId, ...values });
      if (pending.current?.key !== key)
        pending.current = { key, id: crypto.randomUUID() };
      try {
        const response = await fetch("/api/trip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            tripId,
            ...values,
            requestId: pending.current.id,
          }),
        });
        const data = (await response.json()) as Snapshot & { error?: string };
        if (!response.ok) {
          if (response.status < 500) pending.current = null;
          throw new Error(data.error);
        }
        pending.current = null;
        if (action === "start") {
          viewId.current = undefined;
          setDayFilter(0);
        }
        apply(data);
        return data as Snapshot;
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "記録を更新できませんでした。",
        );
        return null;
      } finally {
        mutating.current = false;
        setBusy(false);
      }
    },
    [apply],
  );
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 9000);
    return () => clearTimeout(timeout);
  }, [notice]);
  const trip = snapshot?.trip ?? null,
    active = trip?.status === "active",
    now = trip ? Math.min(clock, trip.deadline) : clock,
    day = trip ? tripDay(trip, now) : 1;
  const balance = trip?.balance ?? days * Number(daily || 0),
    total = trip?.totalBudget ?? days * Number(daily || 0),
    entries = trip?.entries ?? [],
    photoEntries = entries.filter((e) => e.image),
    messages = entries.filter(
      (e) => e.category !== "transport" && e.category !== "funding",
    ),
    latestPhoto = photoEntries.at(-1),
    recent = [
      ...(latestPhoto ? [latestPhoto] : []),
      ...messages.filter((e) => e.id !== latestPhoto?.id).slice(-1),
    ].slice(0, 2),
    expenses = entries.filter((e) => e.amount !== 0);
  const currentOtherTrip = snapshot?.history.find(
    (h) => h.status === "active" && h.id !== trip?.id,
  );
  const activity = trip?.activity,
    position = trip ? currentPosition(trip, now) : placeById.hakata.point,
    traveledRoute = trip?.routeHistory ?? [],
    route =
      activity?.kind === "move" ? activity.legs.flatMap((l) => l.points) : [],
    remaining = activity ? Math.max(0, activity.end - now) : 0;
  const primaryMode = activity?.legs.some((l) => l.mode === "train")
      ? "train"
      : "walk",
    TransportIcon = primaryMode === "train" ? TrainFront : Footprints;
  const spent = entries
      .filter((e) => e.amount > 0)
      .reduce((n, e) => n + e.amount, 0),
    usedCategories = (
      ["transport", "food", "stay", "sightseeing"] as Category[]
    ).map((c) => ({
      category: c,
      amount: entries
        .filter((e) => e.category === c)
        .reduce((n, e) => n + e.amount, 0),
    }));
  const start = async () => {
    if (
      await mutate("start", { days, dailyBudget: Number(daily), personality })
    ) {
      setSetup(false);
      setTab("map");
      setNotice(
        "こむぎを旅に送り出しました。最初のメッセージは、5分ほどで届きます。",
      );
    }
  };
  const addMoney = async () => {
    if (await mutate("fund", { amount: funding })) {
      setSponsor(false);
      setNotice(`こむぎに ¥${money(funding)} のおこづかいを届けました。`);
    }
  };
  // The same server actions are available to supported in-page agents. No data is sent elsewhere.
  const actionRef = useRef({ mutate, start });
  actionRef.current = { mutate, start };
  useEffect(() => {
    const context = (document as any).modelContext;
    if (!context?.registerTool) return;
    const controller = new AbortController();
    const register = (tool: any) => {
      try {
        Promise.resolve(
          context.registerTool(tool, { signal: controller.signal }),
        ).catch(() => {});
      } catch {}
    };
    register({
      name: "read_komugi_trip",
      description:
        "現在画面で見守っているこむぎの旅・残金・直近のメッセージを読む。",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: () => {
        const t = stateRef.current?.trip;
        return t
          ? {
              status: t.status,
              place: placeById[t.placeId].name,
              balance: t.balance,
              activity: t.activity.label,
              recent: t.entries.slice(-3),
            }
          : { status: "not_started" };
      },
    });
    register({
      name: "advance_komugi_demo_time",
      description:
        "POCの確認用に旅の時間を1・6・24時間進め、移動と支出を保存する。通常の実時間経過は継続する。",
      inputSchema: {
        type: "object",
        properties: { hours: { type: "integer", enum: [1, 6, 24] } },
        required: ["hours"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: async (input: unknown) => {
        const hours = (input as any)?.hours;
        if (![1, 6, 24].includes(hours))
          throw new Error("時間は1・6・24から選んでください。");
        const data = await actionRef.current.mutate("advance", { hours });
        if (!data) throw new Error("旅を進められませんでした。");
        return {
          status: data.trip?.status,
          balance: data.trip?.balance,
          activity: data.trip?.activity.label,
        };
      },
    });
    return () => controller.abort();
  }, []);
  const empty = (label: string) => (
    <section className="panel screen-panel">
      <h2>{label}</h2>
      <p className="screen-intro">こむぎとのメッセージが、ここに増えていきます。</p>
      <Button disabled={loading} onClick={() => setSetup(true)}>
        はじめての旅に送り出す
        <Send />
      </Button>
    </section>
  );
  return (
    <Tabs value={tab} onValueChange={setTab} className="app-tabs">
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark">
            <PawPrint size={25} />
          </span>
          <div>
            <div className="brand-name">こむぎの旅</div>
            <div className="brand-sub">A LITTLE JOURNEY</div>
          </div>
        </div>
        <TabsList className="top-nav">
          <TabsTrigger value="map">
            <Map />
            いまのこむぎ
          </TabsTrigger>
          <TabsTrigger value="diary">
            <MessageCircle />
            メッセージ
          </TabsTrigger>
          <TabsTrigger value="album">
            <Images />
            アルバム
          </TabsTrigger>
          <TabsTrigger value="wallet">
            <Wallet />
            おこづかい帳
          </TabsTrigger>
        </TabsList>
        <button
          className="about-button"
          onClick={() => setAbout(true)}
          aria-label="この旅について"
        >
          <Info size={17} />
          <span>この旅について</span>
        </button>
      </header>
      <main className="app-body">
        <div className="page-heading">
          <div>
            <p className="eyebrow">
              {trip
                ? `${date(trip.startedAt)} からの福岡旅 · ${trip.days} DAYS`
                : "KOMUGI’S TRAVEL JOURNAL · FUKUOKA"}
            </p>
            <h1>
              {trip?.status === "completed"
                ? "おかえり、こむぎ。"
                : "こむぎの、気ままな旅。"}
            </h1>
          </div>
          <Button
            className="heading-action"
            disabled={loading || busy}
            onClick={() => {
              if (currentOtherTrip) {
                viewId.current = currentOtherTrip.id;
                void refresh(currentOtherTrip.id);
                setTab("map");
              } else if (active) setSponsor(true);
              else setSetup(true);
            }}
          >
            {active ? <Plus size={15} /> : <Send size={15} />}
            <span>
              {currentOtherTrip
                ? "いまの旅に戻る"
                : active
                  ? "おこづかいを送る"
                  : "旅に送り出す"}
            </span>
          </Button>
        </div>
        {error && (
          <div className="error-box" role="alert">
            {error}{" "}
            <button
              className="text-button"
              disabled={busy}
              onClick={() => void refresh()}
            >
              <RefreshCw size={14} />
              再読み込み
            </button>
          </div>
        )}
        {notice && (
          <div className="notice" role="status">
            {notice}
            <button
              className="text-button"
              style={{ float: "right" }}
              aria-label="お知らせを閉じる"
              onClick={() => setNotice("")}
            >
              ×
            </button>
          </div>
        )}
        <TabsContent value="map">
          <div className="journey-layout">
            <aside className="left-column">
              <section className="panel profile-card">
                <span className="trip-status">
                  {trip?.status === "completed" ? <Check /> : <Footprints />}
                  {loading
                    ? "準備しています"
                    : trip?.status === "completed"
                      ? "ただいま"
                      : active
                        ? "気ままに旅の途中"
                        : "旅じたく中"}
                </span>
                <div className="mascot-space">
                  <img
                    src="/images/komugi.png"
                    alt="バンダナとリュックを身につけた、子犬のぬいぐるみ・こむぎ"
                  />
                </div>
                <h2>こむぎ</h2>
                <p className="tagline">おいしいものと、寄り道が好き。</p>
                <div className="traits">
                  <span className="trait">
                    {personalities[trip?.personality ?? personality]}
                  </span>
                  <span className="trait">のんびり屋</span>
                </div>
                <div className="journey-days">
                  <span>{trip ? "福岡をめぐる旅" : "はじめての福岡旅"}</span>
                  <strong>
                    {trip ? day : days}{" "}
                    <small>{trip ? `/ ${trip.days} 日目` : "日間"}</small>
                  </strong>
                </div>
                <div className="day-dots">
                  {Array.from({ length: trip?.days ?? days }, (_, i) => (
                    <span key={i} className={trip && i < day ? "past" : ""} />
                  ))}
                </div>
              </section>
              <section className="panel wallet-card">
                <h2 className="section-label">
                  <Wallet />
                  旅のおこづかい
                </h2>
                <div className="wallet-number">
                  <span>¥</span>
                  {money(balance)}
                </div>
                <p className="wallet-caption">
                  {trip
                    ? "こむぎのお財布に残っているお金"
                    : `${days}日間の旅の予算`}
                </p>
                <div className="budget-track">
                  <span
                    style={{ width: `${total ? (balance / total) * 100 : 0}%` }}
                  />
                </div>
                <div className="budget-meta">
                  <span>
                    {spent
                      ? `使ったお金 ¥${money(spent)}`
                      : "まだ使っていないよ"}
                  </span>
                  <span>¥{money(total)}</span>
                </div>
                <button
                  className="text-button"
                  onClick={() => setTab("wallet")}
                >
                  くわしく見る
                  <ArrowUpRight size={15} />
                </button>
              </section>
              <p className="side-note">
                <Heart size={15} />
                行き先は、こむぎにおまかせ。
                <br />
                あなたはそっと、見守るだけ。
              </p>
            </aside>
            <div className="main-column">
              <div className="map-panel">
                <JourneyMap
                  position={position}
                  traveledRoute={traveledRoute}
                  route={route}
                  moving={activity?.kind === "move"}
                  bubble={
                    activity?.kind === "sleep"
                      ? "すやすや。明日もいい旅に。"
                      : trip?.status === "completed"
                        ? "ただいま！帰ってきたよ。"
                        : undefined
                  }
                />
                {(traveledRoute.length > 1 || route.length > 1) && (
                  <div className="map-route-legend" aria-label="経路の凡例">
                    {traveledRoute.length > 1 && (
                      <span>
                        <i className="route-key traveled" />
                        通った道
                      </span>
                    )}
                    {route.length > 1 && (
                      <span>
                        <i className="route-key planned" />
                        移動中の経路
                      </span>
                    )}
                  </div>
                )}
                <div className="map-top">
                  <div className="map-location">
                    <MapPin />
                    <div>
                      <small>
                        {active ? "TRAVELING IN FUKUOKA" : "STARTING POINT"}
                      </small>
                      <strong>
                        福岡県 ·{" "}
                        {trip ? placeById[trip.placeId].area : "博多駅"}
                        {activity?.kind === "move" ? "から移動中" : ""}
                      </strong>
                    </div>
                  </div>
                  <div className="weather">
                    <Sun />
                    晴れ
                  </div>
                </div>
                <div className="map-bottom">
                  <div className="transport-icon">
                    {activity?.kind === "sleep" ? (
                      <House size={21} />
                    ) : (
                      <TransportIcon size={21} />
                    )}
                  </div>
                  <div className="destination">
                    <strong>
                      {activity?.label ?? "小さなリュックに、わくわくを。"}
                    </strong>
                    <p>
                      {active
                        ? activity?.kind === "move"
                          ? `${[...new Set(activity.legs.map((l) => modeNames[l.mode]))].join("・")}で、次の寄り道へ。`
                          : "こむぎのペースで、旅が進んでいます。"
                        : trip
                          ? "旅のアルバムに、思い出をしまったよ。"
                          : "日数とおこづかいを決めたら、旅がはじまります。"}
                    </p>
                  </div>
                  {active ? (
                    <div className="eta">
                      {activity?.kind === "move" ? "到着まで" : "次の行動まで"}
                      <strong>
                        {duration(remaining)}
                      </strong>
                    </div>
                  ) : (
                    <Button
                      disabled={loading}
                      onClick={() => (trip ? setTab("album") : setSetup(true))}
                    >
                      {trip ? "旅の記録" : "旅じたく"}
                    </Button>
                  )}
                </div>
              </div>
              <p className="journey-map-note">
                実在の地図上を旅するシミュレーション ·
                福岡市周辺の路線データによる経路・運賃・所要時間の目安です
              </p>
              <div className="recent-heading">
                <h2>
                  <MessageCircle />
                  こむぎのメッセージ
                  {trip && (
                    <span className="count-pill">
                      {
                        entries.filter(
                          (e) =>
                            e.category !== "transport" &&
                            e.category !== "funding",
                        ).length
                      }
                    </span>
                  )}
                </h2>
                {trip ? (
                  <button
                    className="text-button"
                    onClick={() => setTab("diary")}
                  >
                    すべて見る
                    <ArrowUpRight size={15} />
                  </button>
                ) : (
                  <span className="demo-caption">旅のイメージ</span>
                )}
              </div>
              {trip ? (
                <div className="message-thread message-thread-preview">
                  {recent.map((e) => (
                    <MessageCard
                      key={e.id}
                      entry={e}
                      onClick={() => setDetail(e)}
                    />
                  ))}
                </div>
              ) : (
                <SampleMessages />
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="diary">
          {trip ? (
            <section className="panel screen-panel">
              <h2>メッセージ</h2>
              <p className="screen-intro">
                寄り道も、ごはんも、おやすみも。こむぎから届く、旅のメッセージ。
              </p>
              <div className="day-list">
                <button
                  className={dayFilter === 0 ? "selected" : ""}
                  onClick={() => setDayFilter(0)}
                >
                  すべて
                </button>
                {Array.from({ length: day }, (_, i) => (
                  <button
                    className={dayFilter === i + 1 ? "selected" : ""}
                    key={i}
                    onClick={() => setDayFilter(i + 1)}
                  >
                    {i + 1}日目
                  </button>
                ))}
              </div>
              <div className="message-shell">
                <div className="message-shell-head">
                  <div className="message-shell-avatar">
                    <img src="/images/komugi.png" alt="" />
                  </div>
                  <div>
                    <strong>こむぎ</strong>
                    <span>{active ? "旅の途中 · メッセージ" : "旅の記録"}</span>
                  </div>
                  <MessageCircle aria-hidden="true" />
                </div>
                <div className="message-thread">
                {[...entries]
                  .reverse()
                  .filter((e) => !dayFilter || e.day === dayFilter)
                  .map((e) => (
                    <MessageCard
                      key={e.id}
                      entry={e}
                      onClick={() => setDetail(e)}
                    />
                  ))}
                </div>
              </div>
            </section>
          ) : (
            empty("メッセージ")
          )}
        </TabsContent>
        <TabsContent value="album">
          {trip ? (
            <section className="panel screen-panel">
              {snapshot && snapshot.history.length > 1 && (
                <div className="history-picker">
                  <label htmlFor="history">見守った旅</label>
                  <select
                    id="history"
                    value={trip.id}
                    onChange={(e) => {
                      viewId.current = e.target.value;
                      setDayFilter(0);
                      void refresh(e.target.value);
                    }}
                  >
                    {snapshot.history.map((h, i) => (
                      <option key={h.id} value={h.id}>
                        {date(h.created_at)}の旅
                        {h.status === "active" ? "（旅行中）" : ""} ·{" "}
                        {snapshot.history.length - i}回目
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {trip.status === "completed" ? (
                <div className="return-banner">
                  <div>
                    <h2>{trip.days}日間の、小さな大冒険。</h2>
                    <p>「たくさんの寄り道を、ありがとう。」</p>
                  </div>
                  <img
                    className="report-image"
                    src="/images/komugi.png"
                    alt="帰ってきたこむぎ"
                  />
                </div>
              ) : (
                <>
                  <h2>旅のアルバム</h2>
                  <p className="screen-intro">
                    こむぎが集めた、忘れたくない瞬間。
                  </p>
                </>
              )}
              <div className="stats-grid">
                <div className="stat-box">
                  <span>訪れたエリア</span>
                  <strong>
                    {new Set(trip.visited.map((id) => placeById[id].area)).size}
                    <small> 地域</small>
                  </strong>
                </div>
                <div className="stat-box">
                  <span>移動した距離</span>
                  <strong>
                    {trip.distanceKm.toFixed(1)}
                    <small> km</small>
                  </strong>
                </div>
                <div className="stat-box">
                  <span>おいしいごはん</span>
                  <strong>
                    {entries.filter((e) => e.category === "food").length}
                    <small> 回</small>
                  </strong>
                </div>
                <div className="stat-box">
                  <span>見つけた寄り道</span>
                  <strong>
                    {trip.visited.length}
                    <small> か所</small>
                  </strong>
                </div>
              </div>
              <div className="recent-heading">
                <h2>
                  思い出の写真{" "}
                  <span className="count-pill">{photoEntries.length}</span>
                </h2>
                <span className="demo-caption">AIで制作した旅のイメージ</span>
              </div>
              {photoEntries.length ? (
              <div className="message-thread">
                {[...photoEntries].reverse().map((e) => (
                    <MessageCard
                      key={e.id}
                      entry={e}
                      onClick={() => setDetail(e)}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-note">
                  まだ旅のはじまり。最初の一枚は、出発から5分ほどで届きます。
                </div>
              )}
              <div className="recent-heading">
                <h2>旅の収支</h2>
                <button
                  className="text-button"
                  onClick={() => setTab("wallet")}
                >
                  内訳を見る
                  <ArrowUpRight size={15} />
                </button>
              </div>
              <div className="finance-summary">
                <div>
                  <span>総予算</span>
                  <strong>¥{money(total)}</strong>
                </div>
                <div>
                  <span>使ったお金</span>
                  <strong>¥{money(spent)}</strong>
                </div>
                <div>
                  <span>残ったお金</span>
                  <strong className="balance">¥{money(balance)}</strong>
                </div>
              </div>
            </section>
          ) : (
            empty("旅のアルバム")
          )}
        </TabsContent>
        <TabsContent value="wallet">
          {trip ? (
            <section className="panel screen-panel">
              <h2>おこづかい帳</h2>
              <p className="screen-intro">
                小さな支出のひとつひとつに、旅の思い出。
              </p>
              <div className="finance-summary">
                <div>
                  <span>渡したおこづかい</span>
                  <strong>¥{money(total)}</strong>
                </div>
                <div>
                  <span>ここまでの支出</span>
                  <strong>¥{money(spent)}</strong>
                </div>
                <div>
                  <span>残っているお金</span>
                  <strong className="balance">¥{money(balance)}</strong>
                </div>
              </div>
              {active && (
                <p className="reserve-note">
                  <Heart size={16} />
                  帰り道と、これからの宿・ごはんに約 ¥
                  {money(snapshot?.reserve ?? 0)} を残しているよ。
                </p>
              )}
              <div className="summary-categories">
                {usedCategories
                  .filter((c) => c.amount > 0)
                  .map((c) => (
                    <span
                      key={c.category}
                      style={{
                        width: `${(c.amount / Math.max(1, spent)) * 100}%`,
                        background: categoryColors[c.category],
                      }}
                    />
                  ))}
              </div>
              <div className="category-labels">
                {usedCategories.map((c) => (
                  <span key={c.category}>
                    <i style={{ background: categoryColors[c.category] }} />
                    {categories[c.category]} ¥{money(c.amount)}
                  </span>
                ))}
              </div>
              {expenses.length ? (
                <div className="ledger-scroll">
                  <table className="ledger">
                    <thead>
                      <tr>
                        <th>いつ</th>
                        <th>使いみち</th>
                        <th>種類</th>
                        <th>金額</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...expenses].reverse().map((e) => (
                        <tr key={e.id}>
                          <td>
                            {e.day}日目 {time(e.time)}
                          </td>
                          <td>
                            {e.title}
                            <small className="ledger-place">
                              {placeById[e.placeId].area}
                            </small>
                          </td>
                          <td>
                            <span className="receipt-category">
                              {categories[e.category]}
                            </span>
                          </td>
                          <td className={e.amount < 0 ? "balance" : ""}>
                            {e.amount < 0 ? "+" : "−"} ¥
                            {money(Math.abs(e.amount))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-note">
                  おこづかい、大切に持っているよ。使ったら、ここに記録するね。
                </div>
              )}
              <p className="form-help">
                すべてゲーム内の仮想予算です。実際の決済・予約は行われません。
              </p>
            </section>
          ) : (
            empty("おこづかい帳")
          )}
        </TabsContent>
        <footer className="footer">
          <span>
            こむぎの旅 <span style={{ margin: "0 10px", opacity: 0.5 }}>/</span>
            小さな旅を、見守ろう。
          </span>
          {active ? (
            <div className="demo-controls">
              <span>
                <Clock3
                  size={13}
                  style={{ display: "inline", marginRight: 5 }}
                />
                旅の時刻 {time(now)}
              </span>
              <span className="demo-caption">体験を早送り</span>
              {[1, 6, 24].map((h) => (
                <button
                  disabled={busy}
                  key={h}
                  onClick={() => void mutate("advance", { hours: h })}
                >
                  <FastForward />+{h === 24 ? "1日" : `${h}時間`}
                </button>
              ))}
            </div>
          ) : (
            <span className="demo-caption">福岡編 · POC</span>
          )}
        </footer>
      </main>
      <Dialog open={setup} onOpenChange={setSetup}>
        <DialogContent className="journey-dialog">
          <DialogTitle>こむぎの旅じたく</DialogTitle>
          <DialogDescription>
            日数と予算を渡したら、行き先はこむぎにおまかせ。
          </DialogDescription>
          <form
            className="setup-form"
            onSubmit={(e) => {
              e.preventDefault();
              void start();
            }}
          >
            <div>
              <span className="form-label">どのくらい旅をする？</span>
              <div className="choice-row">
                {[3, 7].map((d) => (
                  <button
                    type="button"
                    aria-pressed={days === d}
                    className={days === d ? "selected" : ""}
                    key={d}
                    onClick={() => setDays(d)}
                  >
                    {d}日間
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label" htmlFor="budget">
                1日あたりのおこづかい
              </label>
              <div className="budget-input">
                <span>¥</span>
                <Input
                  id="budget"
                  type="number"
                  required
                  min={7000}
                  max={30000}
                  step={1000}
                  value={daily}
                  onChange={(e) => setDaily(e.target.value)}
                  className="field-input"
                />
              </div>
              <p className="form-help">
                7,000〜30,000円。日数分を、出発時にまとめて渡します。
              </p>
            </div>
            <div>
              <span className="form-label">今回のこむぎは？</span>
              <div className="choice-row personality-choices">
                {Object.entries(personalities).map(([key, value]) => (
                  <button
                    type="button"
                    aria-pressed={personality === key}
                    key={key}
                    className={personality === key ? "selected" : ""}
                    onClick={() => setPersonality(key as Personality)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <p className="form-help">
              出発地は博多駅。旅は実時間で進み、閉じていた間の行動も次に開くと反映されます。
            </p>
            <div className="total-row">
              <span>こむぎに渡すおこづかい</span>
              <strong>¥{money(Number(daily) * days)}</strong>
            </div>
            {error && (
              <p role="alert" className="error-box">
                {error}
              </p>
            )}
            <Button
              className="primary-action"
              type="submit"
              disabled={busy || !Number(daily)}
            >
              {busy ? "リュックを準備中…" : "いってらっしゃい、こむぎ"}
              <Send size={16} />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={sponsor} onOpenChange={setSponsor}>
        <DialogContent>
          <DialogTitle>旅に、ちょっと差し入れ。</DialogTitle>
          <DialogDescription>
            追加のおこづかいで、こむぎの寄り道が変わるかもしれません。
          </DialogDescription>
          <div className="choice-row" style={{ margin: "15px 0" }}>
            {[1000, 3000, 5000].map((n) => (
              <button
                key={n}
                aria-pressed={funding === n}
                className={funding === n ? "selected" : ""}
                onClick={() => setFunding(n)}
              >
                ¥{money(n)}
              </button>
            ))}
          </div>
          <p className="form-help">
            仮想のおこづかいです。実際のお支払いはありません。
          </p>
          {error && (
            <p className="error-box" role="alert">
              {error}
            </p>
          )}
          <Button
            className="primary-action"
            disabled={busy}
            onClick={() => void addMoney()}
          >
            <Send />
            {busy ? "届けています…" : `¥${money(funding)} を届ける`}
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <DialogContent className="message-dialog">
          <DialogTitle>{detail?.title}</DialogTitle>
          <DialogDescription>
            {detail &&
              `${placeById[detail.placeId].area} · ${detail.day}日目 ${time(detail.time)}`}
          </DialogDescription>
          {detail?.image && (
            <img
              className={`photo-detail ${detail.image === "komugi" ? "portrait-photo" : ""}`}
              src={imageSrc(detail.image)}
              alt="こむぎの旅のイメージ写真"
            />
          )}
          <p className="detail-text">{detail?.text}</p>
          <div className="receipt-line">
            <span>
              {detail?.amount && detail.amount < 0
                ? "受け取ったお金"
                : "使ったお金"}
            </span>
            <strong>¥{money(Math.abs(detail?.amount ?? 0))}</strong>
          </div>
          <div className="receipt-line">
            <span>このときの残金</span>
            <span>¥{money(detail?.balance ?? 0)}</span>
          </div>
          {detail?.image && (
            <p className="form-help">写真はAIで制作した旅のイメージです。</p>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={about} onOpenChange={setAbout}>
        <DialogContent>
          <DialogTitle>小さな旅を、見守ろう。</DialogTitle>
          <DialogDescription>
            あなたは、こむぎの旅のスポンサーです。
          </DialogDescription>
          <div className="about-copy">
            <p>
              日数とおこづかいを決めたら、あとはこむぎにおまかせ。食べたり、歩いたり、ちょっと寄り道したり。気ままな旅から、メッセージが届きます。
            </p>
            <p>
              旅行の状態と支出は保存されます。同じブラウザで開くと続きから見守れます。画面下の早送りを使えば、数日間の旅をすぐに体験できます。
            </p>
            <p>
              おこづかいは仮想予算で、実際の決済はありません。天気はいつも晴れ。写真はAIで制作したイメージで、実際の施設・料理を再現するものではありません。
            </p>
            <p>
              POCでは実在の地図に、福岡市周辺の徒歩リンクと鉄道路線グラフを重ねて表示します。運賃・所要時間・営業情報はシミュレーション値です。メッセージはアプリ内で確認できます。アプリを閉じた間のプッシュ通知は未対応です。
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
