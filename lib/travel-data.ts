// Curated POC data. Coordinates are real-world locations; prices and paths are simulation estimates.
export type Point = [number, number];
export type Personality = "foodie" | "frugal" | "rail" | "cyclist";
export type Mode = "walk" | "train" | "bicycle";
export const personalities: Record<Personality, string> = {
  foodie: "食いしん坊",
  frugal: "節約家",
  rail: "鉄道好き",
  cyclist: "自転車好き",
};
export const modeNames: Record<Mode, string> = {
  walk: "徒歩",
  train: "電車",
  bicycle: "自転車",
};
export type Place = {
  id: string;
  name: string;
  area: string;
  point: Point;
  category: "city" | "park" | "sea" | "shrine";
  price: number;
  minutes: number;
  diary: string;
  image?: string;
};
export const places: Place[] = [
  {
    id: "hakata",
    name: "博多駅",
    area: "博多",
    point: [33.5897, 130.4207],
    category: "city",
    price: 0,
    minutes: 30,
    diary: "リュックを背負ったら、なんだか少し勇気が出たよ。いってきます！",
  },
  {
    id: "canal",
    name: "博多の運河沿い",
    area: "博多",
    point: [33.5898, 130.4108],
    category: "city",
    price: 0,
    minutes: 50,
    diary: "水辺のベンチで、ひと休み。行き交う人を眺めるのも、旅の楽しみだね。",
  },
  {
    id: "nakasu",
    name: "中洲の川沿い",
    area: "中洲",
    point: [33.5917, 130.4064],
    category: "city",
    price: 0,
    minutes: 70,
    diary:
      "川面がきらきらしていたよ。屋台から、おいしそうな匂い。おなかが鳴っちゃった。",
  },
  {
    id: "tenjin",
    name: "天神のまち歩き",
    area: "天神",
    point: [33.5903, 130.3987],
    category: "city",
    price: 0,
    minutes: 60,
    diary:
      "にぎやかな道を、てくてく。小さな路地を見つけると、つい曲がりたくなるんだ。",
  },
  {
    id: "ohori",
    name: "大濠公園",
    area: "大濠",
    point: [33.5863, 130.3762],
    category: "park",
    price: 0,
    minutes: 90,
    diary:
      "池のまわりを一周したよ。水鳥を数えていたら、いつのまにか時間がたっていた。",
  },
  {
    id: "maizuru",
    name: "舞鶴公園",
    area: "大濠",
    point: [33.5844, 130.3821],
    category: "park",
    price: 0,
    minutes: 75,
    diary:
      "石垣の上から、福岡の街が見えたよ。ずっと昔にも、ここを旅した誰かがいたのかな。",
  },
  {
    id: "nishijin",
    name: "西新の商店街",
    area: "西新",
    point: [33.5836, 130.3596],
    category: "city",
    price: 0,
    minutes: 70,
    diary:
      "商店街を歩いていたら、すっかりこの街の気分。小さな寄り道がいちばん好きかも。",
  },
  {
    id: "momochi",
    name: "百道の海辺",
    area: "百道",
    point: [33.5955, 130.3512],
    category: "sea",
    price: 0,
    minutes: 100,
    diary:
      "はじめて見る、福岡の海！靴に砂が入ったけど、なんだかそれもうれしいな。",
    image: "coast",
  },
  {
    id: "tower",
    name: "百道の展望スポット",
    area: "百道",
    point: [33.5933, 130.3515],
    category: "city",
    price: 800,
    minutes: 75,
    diary:
      "高いところから、街と海を見渡したよ。あの遠くの道も、いつか歩いてみたいな。",
  },
  {
    id: "meinohama",
    name: "姪浜の港町",
    area: "姪浜",
    point: [33.5867, 130.3256],
    category: "city",
    price: 0,
    minutes: 60,
    diary: "港のほうから潮の香り。海のある暮らしって、どんな感じなんだろう。",
  },
  {
    id: "itoshima",
    name: "糸島の小さなまち",
    area: "糸島",
    point: [33.5573, 130.1993],
    category: "city",
    price: 0,
    minutes: 80,
    diary:
      "列車を降りたら、空が広くなった気がしたよ。海へ続く道を探してみよう。",
  },
  {
    id: "futami",
    name: "糸島の海岸",
    area: "糸島",
    point: [33.6427, 130.1968],
    category: "sea",
    price: 0,
    minutes: 120,
    diary:
      "青い海が、どこまでも続いていたよ。波の音を聞いていたら、帰りたくなくなっちゃった。",
    image: "coast",
  },
  {
    id: "dazaifu",
    name: "太宰府の大きな神社",
    area: "太宰府",
    point: [33.5215, 130.5347],
    category: "shrine",
    price: 0,
    minutes: 100,
    diary:
      "大きな木に囲まれて、背筋がすっと伸びたよ。これからもいい旅ができますように。",
  },
  {
    id: "kashii",
    name: "香椎の参道",
    area: "香椎",
    point: [33.6541, 130.4435],
    category: "shrine",
    price: 0,
    minutes: 70,
    diary:
      "木漏れ日の参道をゆっくり歩いたよ。葉っぱの揺れる音まで、聞こえるくらい静かだった。",
  },
  {
    id: "uminaka",
    name: "海の中道の公園",
    area: "海の中道",
    point: [33.6608, 130.3619],
    category: "park",
    price: 450,
    minutes: 130,
    diary:
      "広い芝生で、大きく深呼吸。今日はいつもより、たくさん歩けそうな気がする。",
  },
  {
    id: "gannosu",
    name: "雁の巣の海沿い",
    area: "海の中道",
    point: [33.6792, 130.4046],
    category: "sea",
    price: 0,
    minutes: 80,
    diary:
      "海沿いを走る風が気持ちいいね。リュックも、なんだか軽くなったみたい。",
    image: "coast",
  },
];
export const placeById = Object.fromEntries(
  places.map((p) => [p.id, p]),
) as Record<string, Place>;
export type Edge = { a: string; b: string; rail: boolean; points: Point[] };
function edge(a: string, b: string, rail: boolean, ...middle: Point[]): Edge {
  return {
    a,
    b,
    rail,
    points: [placeById[a].point, ...middle, placeById[b].point],
  };
}
export const edges: Edge[] = [
  edge("hakata", "canal", false, [33.5887, 130.4171], [33.5888, 130.4114]),
  edge("canal", "nakasu", false, [33.5915, 130.4094]),
  edge("nakasu", "tenjin", true, [33.5947, 130.4052], [33.592, 130.402]),
  edge("hakata", "nakasu", true, [33.5946, 130.4147], [33.597, 130.4099]),
  edge(
    "tenjin",
    "ohori",
    true,
    [33.5905, 130.3888],
    [33.5904, 130.3792],
    [33.5882, 130.3765],
  ),
  edge("ohori", "maizuru", false, [33.5846, 130.3787]),
  edge("ohori", "nishijin", true, [33.5901, 130.3736], [33.5881, 130.3651]),
  edge("nishijin", "momochi", false, [33.5854, 130.3549], [33.5908, 130.3517]),
  edge("momochi", "tower", false),
  edge(
    "nishijin",
    "meinohama",
    true,
    [33.5814, 130.3492],
    [33.5808, 130.3371],
    [33.5837, 130.3275],
  ),
  edge(
    "meinohama",
    "itoshima",
    true,
    [33.5826, 130.3135],
    [33.5797, 130.3006],
    [33.577, 130.2877],
    [33.577, 130.26],
    [33.5661, 130.2408],
    [33.562, 130.2232],
  ),
  edge(
    "itoshima",
    "futami",
    false,
    [33.5621, 130.2078],
    [33.5724, 130.2192],
    [33.5911, 130.2185],
    [33.6102, 130.2062],
    [33.6271, 130.2055],
  ),
  edge(
    "tenjin",
    "dazaifu",
    true,
    [33.5786, 130.4017],
    [33.563, 130.4121],
    [33.552, 130.4283],
    [33.5314, 130.4584],
    [33.522, 130.479],
    [33.5006, 130.5175],
    [33.5075, 130.5272],
    [33.5194, 130.5311],
  ),
  edge(
    "hakata",
    "kashii",
    true,
    [33.6067, 130.4224],
    [33.6233, 130.426],
    [33.6395, 130.437],
    [33.6593, 130.4448],
  ),
  edge(
    "kashii",
    "gannosu",
    true,
    [33.6676, 130.44],
    [33.687, 130.4312],
    [33.6885, 130.4199],
  ),
  edge(
    "gannosu",
    "uminaka",
    true,
    [33.6741, 130.396],
    [33.6726, 130.38],
    [33.6654, 130.3661],
  ),
];
export type Food = {
  name: string;
  price: number;
  slots: string[];
  preference: Personality[];
  diary: string;
  image?: string;
};
export const foods: Food[] = [
  {
    name: "豚骨ラーメン",
    price: 900,
    slots: ["lunch", "dinner"],
    preference: ["foodie"],
    diary:
      "スープをひと口。おいしくて、思わず耳がぴんとしたよ。福岡に来てよかった！",
    image: "ramen",
  },
  {
    name: "ごぼう天うどん",
    price: 550,
    slots: ["lunch", "dinner"],
    preference: ["frugal"],
    diary:
      "やわらかいうどんと、さくさくのごぼう天。お財布にやさしくて、おなかもぽかぽか。",
  },
  {
    name: "もつ鍋",
    price: 2100,
    slots: ["dinner"],
    preference: ["foodie"],
    diary:
      "今日はちょっとぜいたく。お鍋を囲むだけで、ひとり旅もあたたかくなるね。",
  },
  {
    name: "水炊き",
    price: 2400,
    slots: ["dinner"],
    preference: ["foodie"],
    diary:
      "白いスープに、おいしさがぎゅっと詰まっていたよ。最後まで、大事にいただきました。",
  },
  {
    name: "明太子のおにぎり",
    price: 350,
    slots: ["breakfast", "lunch", "dinner"],
    preference: ["frugal", "rail"],
    diary:
      "おにぎりを持って、ベンチでひと休み。ちょっとぴりっとするのが、好きなんだ。",
  },
  {
    name: "焼き鳥",
    price: 1200,
    slots: ["dinner"],
    preference: ["foodie"],
    diary: "炭の香りに誘われて、つい寄り道。キャベツも一緒に、いただきます。",
  },
  {
    name: "ごまさば定食",
    price: 1600,
    slots: ["lunch", "dinner"],
    preference: ["foodie"],
    diary: "ごまの香りと、新鮮なお魚。ごはんがどんどん進んじゃったよ。",
  },
  {
    name: "たまごサンド",
    price: 450,
    slots: ["breakfast", "lunch"],
    preference: ["cyclist"],
    diary: "ふわふわのたまごサンドで、元気をチャージ。今日もいっぱい歩こう。",
  },
  {
    name: "朝のパンとミルク",
    price: 500,
    slots: ["breakfast"],
    preference: ["foodie"],
    diary: "窓のそばで朝ごはん。今日の地図を広げる、この時間が好き。",
  },
  {
    name: "おむすび朝ごはん",
    price: 350,
    slots: ["breakfast"],
    preference: ["frugal"],
    diary:
      "朝は小さなおむすびから。おこづかいを大事にしながら、今日も楽しむよ。",
  },
  {
    name: "焼きカレー",
    price: 1100,
    slots: ["lunch", "dinner"],
    preference: ["rail"],
    diary: "こんがりチーズの下に、あつあつのカレー。ふうふうしながら食べたよ。",
  },
  {
    name: "海の幸の丼",
    price: 1800,
    slots: ["lunch"],
    preference: ["foodie", "cyclist"],
    diary:
      "海の幸がぎゅっと詰まった丼。ひと口ごとに、うれしくなるね。小さなぜいたく、ありがとう。",
  },
];
export const hotels = [
  { name: "まちの小さな宿", price: 3900 },
  { name: "駅前のシンプルな宿", price: 4500 },
  { name: "静かな通りのホテル", price: 5400 },
  { name: "ゆったりした街のホテル", price: 6500 },
  { name: "窓辺のあるホテル", price: 7200 },
];
