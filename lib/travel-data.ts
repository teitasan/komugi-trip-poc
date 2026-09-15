// Curated POC data. Coordinates are real-world locations; prices and paths are simulation estimates.
export type Point = [number, number];
export type Personality = "foodie" | "frugal" | "rail" | "cyclist";
// New trips use only walking and trains. "bicycle" remains readable for old
// saved trips created before the POC transport scope was narrowed.
export type Mode = "walk" | "train";
export type StoredMode = Mode | "bicycle";
export type RouteSegment = {
  points: Point[];
  mode: StoredMode;
};
export const personalities: Record<Personality, string> = {
  foodie: "食いしん坊",
  frugal: "節約家",
  rail: "鉄道好き",
  cyclist: "海辺好き",
};
export const modeNames: Record<StoredMode, string> = {
  walk: "徒歩",
  train: "電車",
  // Kept so trips persisted by the first POC still render correctly.
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
  /** Local (JST) visiting window. The whole visit must fit before closeHour. */
  openHour: number;
  closeHour: number;
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
    openHour: 7,
    closeHour: 20,
    diary: "リュックを背負ったら、なんだか少し勇気が出たよ。いってきます！",
    image: "hakata.webp",
  },
  {
    id: "hakata-temple",
    name: "博多のお寺",
    area: "博多",
    point: [33.5967, 130.4164],
    category: "shrine",
    price: 0,
    minutes: 60,
    openHour: 8,
    closeHour: 18,
    diary: "大きなお堂の前で、静かな時間。旅の安全をお願いしてきたよ。",
    image: "hakata-temple.webp",
  },
  {
    id: "hakata-mall",
    name: "博多のショッピングモール",
    area: "博多",
    point: [33.5894, 130.4101],
    category: "city",
    price: 0,
    minutes: 100,
    openHour: 10,
    closeHour: 21,
    diary: "お店をいろいろ見て回ったよ。知らないものが並んでいると、つい長居しちゃうね。",
    image: "hakata-mall.webp",
  },
  {
    id: "nakasu",
    name: "中洲の川沿い",
    area: "中洲",
    point: [33.5917, 130.4064],
    category: "city",
    price: 0,
    minutes: 70,
    openHour: 7,
    closeHour: 20,
    diary:
      "川面がきらきらしていたよ。屋台から、おいしそうな匂い。おなかが鳴っちゃった。",
    image: "nakasu.webp",
  },
  {
    id: "tenjin",
    name: "天神のまち歩き",
    area: "天神",
    point: [33.5903, 130.3987],
    category: "city",
    price: 0,
    minutes: 60,
    openHour: 7,
    closeHour: 20,
    diary:
      "にぎやかな道を、てくてく。小さな路地を見つけると、つい曲がりたくなるんだ。",
    image: "tenjin.webp",
  },
  {
    id: "ohori",
    name: "大濠公園",
    area: "大濠",
    point: [33.5863, 130.3762],
    category: "park",
    price: 0,
    minutes: 90,
    openHour: 7,
    closeHour: 19,
    diary:
      "池のまわりを一周したよ。水鳥を数えていたら、いつのまにか時間がたっていた。",
    image: "ohori.webp",
  },
  {
    id: "maizuru",
    name: "舞鶴公園",
    area: "大濠",
    point: [33.5844, 130.3821],
    category: "park",
    price: 0,
    minutes: 75,
    openHour: 7,
    closeHour: 19,
    diary:
      "石垣の上から、福岡の街が見えたよ。ずっと昔にも、ここを旅した誰かがいたのかな。",
    image: "maizuru.webp",
  },
  {
    id: "nishijin",
    name: "西新の商店街",
    area: "西新",
    point: [33.5836, 130.3596],
    category: "city",
    price: 0,
    minutes: 70,
    openHour: 7,
    closeHour: 20,
    diary:
      "商店街を歩いていたら、すっかりこの街の気分。小さな寄り道がいちばん好きかも。",
    image: "nishijin.webp",
  },
  {
    id: "momochi",
    name: "百道の海辺",
    area: "百道",
    point: [33.5955, 130.3512],
    category: "sea",
    price: 0,
    minutes: 100,
    openHour: 7,
    closeHour: 19,
    diary:
      "はじめて見る、福岡の海！靴に砂が入ったけど、なんだかそれもうれしいな。",
    image: "momochi.webp",
  },
  {
    id: "tower",
    name: "百道の展望タワー",
    area: "百道",
    point: [33.5933, 130.3515],
    category: "city",
    price: 800,
    minutes: 75,
    openHour: 9,
    closeHour: 20,
    diary:
      "展望タワーから、街と海を見渡したよ。あの遠くの道も、いつか歩いてみたいな。",
    image: "tower.webp",
  },
  {
    id: "dome",
    name: "百道のドーム",
    area: "百道",
    point: [33.5954, 130.3623],
    category: "city",
    price: 1200,
    minutes: 100,
    openHour: 10,
    closeHour: 20,
    diary:
      "大きなドームを見上げたよ。中から聞こえる歓声に、こむぎもわくわくしたな。",
    image: "dome.webp",
  },
  {
    id: "meinohama",
    name: "姪浜の港町",
    area: "姪浜",
    point: [33.5867, 130.3256],
    category: "city",
    price: 0,
    minutes: 60,
    openHour: 7,
    closeHour: 20,
    diary: "港のほうから潮の香り。海のある暮らしって、どんな感じなんだろう。",
    image: "meinohama.webp",
  },
  {
    id: "itoshima",
    name: "糸島の小さなまち",
    area: "糸島",
    point: [33.5573, 130.1993],
    category: "city",
    price: 0,
    minutes: 80,
    openHour: 7,
    closeHour: 20,
    diary:
      "列車を降りたら、空が広くなった気がしたよ。海へ続く道を探してみよう。",
    image: "itoshima.webp",
  },
  {
    id: "futami",
    name: "糸島の海岸",
    area: "糸島",
    point: [33.6427, 130.1968],
    category: "sea",
    price: 0,
    minutes: 120,
    openHour: 7,
    closeHour: 19,
    diary:
      "青い海が、どこまでも続いていたよ。波の音を聞いていたら、帰りたくなくなっちゃった。",
    image: "futami.webp",
  },
  {
    id: "dazaifu",
    name: "太宰府の大きな神社",
    area: "太宰府",
    point: [33.5215, 130.5347],
    category: "shrine",
    price: 0,
    minutes: 100,
    openHour: 8,
    closeHour: 18,
    diary:
      "大きな木に囲まれて、背筋がすっと伸びたよ。これからもいい旅ができますように。",
    image: "dazaifu.webp",
  },
  {
    id: "kashii",
    name: "香椎の参道",
    area: "香椎",
    point: [33.6541, 130.4435],
    category: "shrine",
    price: 0,
    minutes: 70,
    openHour: 8,
    closeHour: 18,
    diary:
      "木漏れ日の参道をゆっくり歩いたよ。葉っぱの揺れる音まで、聞こえるくらい静かだった。",
    image: "kashii.webp",
  },
  {
    id: "uminaka",
    name: "海の中道の公園",
    area: "海の中道",
    point: [33.6608, 130.3619],
    category: "park",
    price: 450,
    minutes: 130,
    openHour: 9,
    closeHour: 17,
    diary:
      "広い芝生で、大きく深呼吸。今日はいつもより、たくさん歩けそうな気がする。",
    image: "uminaka.webp",
  },
  {
    id: "gannosu",
    name: "雁の巣の海沿い",
    area: "海の中道",
    point: [33.6792, 130.4046],
    category: "sea",
    price: 0,
    minutes: 80,
    openHour: 7,
    closeHour: 19,
    diary:
      "海沿いを走る風が気持ちいいね。リュックも、なんだか軽くなったみたい。",
    image: "gannosu.webp",
  },
];
/**
 * 旧POCで保存された旅の記録を表示・継続するための互換地点。
 * 新しい旅の抽選対象には含めない。
 */
const legacyPlaces: Place[] = [
  {
    id: "canal",
    name: "博多の運河沿い",
    area: "博多",
    point: [33.5898, 130.4108],
    category: "city",
    price: 0,
    minutes: 50,
    openHour: 7,
    closeHour: 20,
    diary: "水辺のベンチで、ひと休み。行き交う人を眺めるのも、旅の楽しみだね。",
  },
];
export const placeById = Object.fromEntries(
  [...places, ...legacyPlaces].map((p) => [p.id, p]),
) as Record<string, Place>;
/**
 * 福岡市内と近郊で使う鉄道ネットワーク。
 *
 * 駅の並びをデータとして持ち、隣駅だけでなく同一路線上の駅同士を
 * 直接結んだエッジを生成する。観光地はこのグラフの目的地ではなく、
 * 観光地から複数の駅へ歩くアクセスリンクを通じて接続される。
 */
export type RailStation = { id: string; name: string; point: Point };
export type RailOperator = "subway" | "jr" | "nishitetsu";
export type RailLine = {
  id: string;
  name: string;
  operator: RailOperator;
  speedKmh: number;
  stopMinutes: number;
  stationIds: string[];
};
export type Edge = {
  a: string;
  b: string;
  mode: Mode;
  points: Point[];
  minutes?: number;
  cost?: number;
  lineId?: string;
};

export const railStations: RailStation[] = [
  // 福岡市地下鉄 空港線
  // Station coordinates are intentionally separate from nearby sightseeing spots.
  { id: "st_meinohama", name: "姪浜駅", point: [33.5839, 130.3269] },
  { id: "st_muromi", name: "室見駅", point: [33.5746, 130.3489] },
  { id: "st_fujisaki", name: "藤崎駅", point: [33.5818, 130.3488] },
  { id: "st_nishijin", name: "西新駅", point: [33.583, 130.3632] },
  { id: "st_tojinmachi", name: "唐人町駅", point: [33.5903, 130.3705] },
  { id: "st_ohori", name: "大濠公園駅", point: [33.5843, 130.3773] },
  { id: "st_akasaka", name: "赤坂駅", point: [33.5899, 130.392] },
  { id: "st_tenjin", name: "天神駅", point: [33.5893, 130.3986] },
  { id: "st_nakasu", name: "中洲川端駅", point: [33.5928, 130.4058] },
  { id: "st_gion", name: "祇園駅", point: [33.5953, 130.4136] },
  { id: "st_hakata", name: "博多駅", point: placeById.hakata.point },
  { id: "st_higashihie", name: "東比恵駅", point: [33.5909, 130.4309] },
  { id: "st_airport", name: "福岡空港駅", point: [33.5859, 130.4442] },
  // 福岡市地下鉄 箱崎線
  { id: "st_gofukumachi", name: "呉服町駅", point: [33.5962, 130.407] },
  { id: "st_chiyo", name: "千代県庁口駅", point: [33.602, 130.407] },
  { id: "st_maidashi", name: "馬出九大病院前駅", point: [33.611, 130.414] },
  { id: "st_hakozaki_miyamae", name: "箱崎宮前駅", point: [33.62, 130.422] },
  { id: "st_hakozaki_kyudai", name: "箱崎九大前駅", point: [33.624, 130.424] },
  { id: "st_kaizuka", name: "貝塚駅", point: [33.65, 130.425] },
  // 福岡市地下鉄 七隈線
  { id: "st_hashimoto", name: "橋本駅", point: [33.565, 130.319] },
  { id: "st_jiromaru", name: "次郎丸駅", point: [33.556, 130.313] },
  { id: "st_kamo", name: "賀茂駅", point: [33.55, 130.322] },
  { id: "st_noke", name: "野芥駅", point: [33.545, 130.342] },
  { id: "st_umebayashi", name: "梅林駅", point: [33.542, 130.36] },
  { id: "st_fukudai", name: "福大前駅", point: [33.536, 130.366] },
  { id: "st_nanokuma", name: "七隈駅", point: [33.533, 130.357] },
  { id: "st_kanayama", name: "金山駅", point: [33.553, 130.364] },
  { id: "st_chayama", name: "茶山駅", point: [33.566, 130.371] },
  { id: "st_befu", name: "別府駅", point: [33.577, 130.371] },
  { id: "st_ropponmatsu", name: "六本松駅", point: [33.579, 130.383] },
  { id: "st_sakurazaka", name: "桜坂駅", point: [33.573, 130.39] },
  { id: "st_yakuin_oodori", name: "薬院大通駅", point: [33.579, 130.397] },
  { id: "st_yakuin", name: "薬院駅", point: [33.58, 130.401] },
  { id: "st_watanabe", name: "渡辺通駅", point: [33.582, 130.403] },
  { id: "st_tenjin_minami", name: "天神南駅", point: [33.587, 130.4] },
  { id: "st_kushida", name: "櫛田神社前駅", point: [33.591, 130.412] },
  // JR 筑肥線・香椎線・鹿児島本線
  { id: "st_shimoyamato", name: "下山門駅", point: [33.575, 130.302] },
  { id: "st_imaijuku", name: "今宿駅", point: [33.577, 130.276] },
  { id: "st_kyudai_gakkentoshi", name: "九大学研都市駅", point: [33.576, 130.25] },
  { id: "st_susenji", name: "周船寺駅", point: [33.566, 130.232] },
  { id: "st_hatae", name: "波多江駅", point: [33.558, 130.214] },
  { id: "st_maebaru", name: "筑前前原駅", point: [33.559, 130.1974] },
  { id: "st_kafuri", name: "加布里駅", point: [33.553, 130.178] },
  { id: "st_kashii", name: "香椎駅", point: [33.6567, 130.4433] },
  { id: "st_wajiro", name: "和白駅", point: [33.687, 130.43] },
  { id: "st_gannosu", name: "雁ノ巣駅", point: [33.6809, 130.4044] },
  { id: "st_saitozaki", name: "西戸崎駅", point: [33.65, 130.363] },
  { id: "st_yoshizuka", name: "吉塚駅", point: [33.607, 130.421] },
  { id: "st_hakozaki_jr", name: "箱崎駅", point: [33.616, 130.426] },
  { id: "st_chihaya", name: "千早駅", point: [33.648, 130.441] },
  { id: "st_sasabaru", name: "笹原駅", point: [33.558, 130.43] },
  { id: "st_minamifukuoka", name: "南福岡駅", point: [33.543, 130.45] },
  { id: "st_kasuga", name: "春日駅", point: [33.532, 130.469] },
  { id: "st_onojo", name: "大野城駅", point: [33.52, 130.48] },
  { id: "st_mizuki", name: "水城駅", point: [33.5, 130.485] },
  { id: "st_jr_futsukaichi", name: "二日市駅", point: [33.489, 130.51] },
  // 西鉄 天神大牟田線・太宰府線・貝塚線
  { id: "st_nt_tenjin", name: "西鉄福岡（天神）駅", point: [33.589, 130.399] },
  { id: "st_nt_hirao", name: "西鉄平尾駅", point: [33.578, 130.4] },
  { id: "st_nt_takamiya", name: "高宮駅", point: [33.566, 130.426] },
  { id: "st_nt_ohashi", name: "大橋駅", point: [33.549, 130.426] },
  { id: "st_nt_ijiri", name: "井尻駅", point: [33.556, 130.444] },
  { id: "st_nt_zasshonokuma", name: "雑餉隈駅", point: [33.552, 130.444] },
  { id: "st_nt_sakurana", name: "桜並木駅", point: [33.544, 130.454] },
  { id: "st_nt_kasugabaru", name: "春日原駅", point: [33.532, 130.469] },
  { id: "st_nt_shirakibaru", name: "白木原駅", point: [33.523, 130.473] },
  { id: "st_nt_shimoori", name: "下大利駅", point: [33.512, 130.481] },
  { id: "st_nt_tofuro", name: "都府楼前駅", point: [33.508, 130.508] },
  { id: "st_nt_futsukaichi", name: "西鉄二日市駅", point: [33.503, 130.516] },
  { id: "st_nt_dazaifu", name: "太宰府駅", point: [33.5198, 130.5361] },
  { id: "st_nt_najima", name: "名島駅", point: [33.64, 130.425] },
  { id: "st_nt_kashii", name: "西鉄香椎駅", point: [33.655, 130.444] },
  { id: "st_nt_kashii_kaenmae", name: "香椎花園前駅", point: [33.667, 130.437] },
  { id: "st_nt_tonoharu", name: "唐の原駅", point: [33.674, 130.435] },
  { id: "st_nt_mitoma", name: "三苫駅", point: [33.696, 130.425] },
  { id: "st_nt_nishitetsu_shingu", name: "西鉄新宮駅", point: [33.716, 130.43] },
];
export const stationById = Object.fromEntries(
  railStations.map((station) => [station.id, station]),
) as Record<string, RailStation>;

export const railLines: RailLine[] = [
  {
    id: "subway-airport",
    name: "福岡市地下鉄空港線",
    operator: "subway",
    speedKmh: 32,
    stopMinutes: 1.4,
    stationIds: [
      "st_meinohama", "st_muromi", "st_fujisaki", "st_nishijin", "st_tojinmachi",
      "st_ohori", "st_akasaka", "st_tenjin", "st_nakasu", "st_gion", "st_hakata",
      "st_higashihie", "st_airport",
    ],
  },
  {
    id: "subway-hakozaki",
    name: "福岡市地下鉄箱崎線",
    operator: "subway",
    speedKmh: 30,
    stopMinutes: 1.4,
    stationIds: [
      "st_nakasu", "st_gofukumachi", "st_chiyo", "st_maidashi", "st_hakozaki_miyamae",
      "st_hakozaki_kyudai", "st_kaizuka",
    ],
  },
  {
    id: "subway-nanakuma",
    name: "福岡市地下鉄七隈線",
    operator: "subway",
    speedKmh: 29,
    stopMinutes: 1.4,
    stationIds: [
      "st_hashimoto", "st_jiromaru", "st_kamo", "st_noke", "st_umebayashi", "st_fukudai",
      "st_nanokuma", "st_kanayama", "st_chayama", "st_befu", "st_ropponmatsu", "st_sakurazaka",
      "st_yakuin_oodori", "st_yakuin", "st_watanabe", "st_tenjin_minami", "st_kushida", "st_hakata",
    ],
  },
  {
    id: "jr-chikuhi",
    name: "JR筑肥線（福岡市〜糸島）",
    operator: "jr",
    speedKmh: 52,
    stopMinutes: 1.8,
    stationIds: [
      "st_meinohama", "st_shimoyamato", "st_imaijuku", "st_kyudai_gakkentoshi", "st_susenji",
      "st_hatae", "st_maebaru", "st_kafuri",
    ],
  },
  {
    id: "jr-kashii",
    name: "JR香椎線",
    operator: "jr",
    speedKmh: 42,
    stopMinutes: 1.8,
    stationIds: ["st_kashii", "st_wajiro", "st_gannosu", "st_saitozaki"],
  },
  {
    id: "jr-kagoshima-north",
    name: "JR鹿児島本線（博多〜香椎）",
    operator: "jr",
    speedKmh: 58,
    stopMinutes: 1.8,
    stationIds: ["st_hakata", "st_yoshizuka", "st_hakozaki_jr", "st_chihaya", "st_kashii"],
  },
  {
    id: "jr-kagoshima-south",
    name: "JR鹿児島本線（博多〜二日市）",
    operator: "jr",
    speedKmh: 58,
    stopMinutes: 1.8,
    stationIds: [
      "st_hakata", "st_yoshizuka", "st_sasabaru", "st_minamifukuoka", "st_kasuga", "st_onojo",
      "st_mizuki", "st_jr_futsukaichi",
    ],
  },
  {
    id: "nishitetsu-tenjin-omuta",
    name: "西鉄天神大牟田線",
    operator: "nishitetsu",
    speedKmh: 48,
    stopMinutes: 1.5,
    stationIds: [
      "st_nt_tenjin", "st_yakuin", "st_nt_hirao", "st_nt_takamiya", "st_nt_ohashi", "st_nt_ijiri",
      "st_nt_zasshonokuma", "st_nt_sakurana", "st_nt_kasugabaru", "st_nt_shirakibaru", "st_nt_shimoori",
      "st_nt_tofuro", "st_nt_futsukaichi",
    ],
  },
  {
    id: "nishitetsu-dazaifu",
    name: "西鉄太宰府線",
    operator: "nishitetsu",
    speedKmh: 35,
    stopMinutes: 1.8,
    stationIds: ["st_nt_futsukaichi", "st_nt_dazaifu"],
  },
  {
    id: "nishitetsu-kaizuka",
    name: "西鉄貝塚線",
    operator: "nishitetsu",
    speedKmh: 37,
    stopMinutes: 1.8,
    stationIds: [
      "st_kaizuka", "st_nt_najima", "st_chihaya", "st_nt_kashii", "st_nt_kashii_kaenmae",
      "st_nt_tonoharu", "st_wajiro", "st_nt_mitoma", "st_nt_nishitetsu_shingu",
    ],
  },
];
export const railLineById = Object.fromEntries(
  railLines.map((line) => [line.id, line]),
) as Record<string, RailLine>;

export type PlaceStationAccess = { stationId: string; minutes: number };
export const placeStationAccess: Record<string, PlaceStationAccess[]> = {
  hakata: [{ stationId: "st_hakata", minutes: 3 }],
  "hakata-temple": [
    { stationId: "st_gion", minutes: 4 },
    { stationId: "st_hakata", minutes: 10 },
  ],
  "hakata-mall": [
    { stationId: "st_kushida", minutes: 5 },
    { stationId: "st_nakasu", minutes: 8 },
    { stationId: "st_gion", minutes: 9 },
  ],
  // Legacy access kept only for trips created before the destination was removed.
  canal: [
    { stationId: "st_nakasu", minutes: 7 },
    { stationId: "st_gion", minutes: 8 },
  ],
  nakasu: [
    { stationId: "st_nakasu", minutes: 3 },
    { stationId: "st_gion", minutes: 8 },
  ],
  tenjin: [
    { stationId: "st_tenjin", minutes: 5 },
    { stationId: "st_tenjin_minami", minutes: 6 },
    { stationId: "st_nt_tenjin", minutes: 7 },
  ],
  ohori: [
    { stationId: "st_ohori", minutes: 5 },
    { stationId: "st_tojinmachi", minutes: 9 },
  ],
  maizuru: [
    { stationId: "st_akasaka", minutes: 8 },
    { stationId: "st_ohori", minutes: 10 },
  ],
  nishijin: [
    { stationId: "st_nishijin", minutes: 4 },
    { stationId: "st_fujisaki", minutes: 10 },
  ],
  momochi: [
    { stationId: "st_nishijin", minutes: 17 },
    { stationId: "st_tojinmachi", minutes: 18 },
  ],
  tower: [
    { stationId: "st_nishijin", minutes: 20 },
    { stationId: "st_fujisaki", minutes: 20 },
  ],
  dome: [
    { stationId: "st_tojinmachi", minutes: 12 },
    { stationId: "st_nishijin", minutes: 18 },
  ],
  meinohama: [{ stationId: "st_meinohama", minutes: 5 }],
  itoshima: [{ stationId: "st_maebaru", minutes: 5 }],
  futami: [{ stationId: "st_kafuri", minutes: 28 }],
  dazaifu: [{ stationId: "st_nt_dazaifu", minutes: 4 }],
  kashii: [
    { stationId: "st_kashii", minutes: 4 },
    { stationId: "st_nt_kashii", minutes: 5 },
  ],
  uminaka: [{ stationId: "st_saitozaki", minutes: 15 }],
  gannosu: [
    { stationId: "st_gannosu", minutes: 4 },
    { stationId: "st_wajiro", minutes: 22 },
  ],
};

function walkEdge(a: string, b: string, ...middle: Point[]): Edge {
  return { a, b, mode: "walk", points: [placeById[a].point, ...middle, placeById[b].point] };
}
const localWalkEdges: Edge[] = [
  walkEdge("hakata", "hakata-temple", [33.592, 130.418]),
  walkEdge("hakata-temple", "hakata-mall", [33.594, 130.413]),
  // Legacy links keep old saved trips routable, but canal is not in places.
  walkEdge("hakata", "canal", [33.5887, 130.4171], [33.5888, 130.4114]),
  walkEdge("canal", "nakasu", [33.5915, 130.4094]),
  walkEdge("ohori", "maizuru", [33.5846, 130.3787]),
  walkEdge("nishijin", "momochi", [33.5854, 130.3549], [33.5908, 130.3517]),
  walkEdge("momochi", "tower"),
  walkEdge("tower", "dome", [33.594, 130.357]),
  walkEdge("itoshima", "futami", [33.5621, 130.2078], [33.5724, 130.2192], [33.5911, 130.2185], [33.6102, 130.2062], [33.6271, 130.2055]),
];
const accessEdges: Edge[] = Object.entries(placeStationAccess).flatMap(
  ([placeId, accesses]) =>
    accesses.map((access) => ({
      a: placeId,
      b: access.stationId,
      mode: "walk" as const,
      points: [placeById[placeId].point, stationById[access.stationId].point],
      minutes: access.minutes,
    })),
);
const transferEdges: Edge[] = [
  {
    a: "st_tenjin",
    b: "st_nt_tenjin",
    mode: "walk",
    points: [stationById.st_tenjin.point, stationById.st_nt_tenjin.point],
    minutes: 5,
  },
  {
    a: "st_kashii",
    b: "st_nt_kashii",
    mode: "walk",
    points: [stationById.st_kashii.point, stationById.st_nt_kashii.point],
    minutes: 5,
  },
  {
    a: "st_jr_futsukaichi",
    b: "st_nt_futsukaichi",
    mode: "walk",
    points: [stationById.st_jr_futsukaichi.point, stationById.st_nt_futsukaichi.point],
    minutes: 6,
  },
];
export function railFare(km: number, operator: RailOperator) {
  if (operator === "subway") {
    const bands = [
      [3, 210], [7, 260], [11, 300], [15, 340], [19, 360], [Infinity, 380],
    ] as const;
    return bands.find(([limit]) => km <= limit)![1];
  }
  const base = operator === "jr" ? 180 : 170;
  const rate = operator === "jr" ? 17 : 15;
  return Math.max(190, Math.ceil((base + km * rate) / 10) * 10);
}
function railEdgesFor(line: RailLine): Edge[] {
  const result: Edge[] = [];
  for (let from = 0; from < line.stationIds.length - 1; from++) {
    for (let to = from + 1; to < line.stationIds.length; to++) {
      const ids = line.stationIds.slice(from, to + 1),
        points = ids.map((id) => stationById[id].point),
        km = points.slice(1).reduce((sum, point, i) => {
          const a = points[i];
          const rad = Math.PI / 180;
          const x = (point[1] - a[1]) * rad * Math.cos(((a[0] + point[0]) / 2) * rad);
          const y = (point[0] - a[0]) * rad;
          return sum + Math.sqrt(x * x + y * y) * 6371;
        }, 0),
        minutes = Math.max(
          3,
          Math.round((km / line.speedKmh) * 60 + (ids.length - 1) * line.stopMinutes + 2),
        );
      result.push({
        a: ids[0],
        b: ids.at(-1)!,
        mode: "train",
        points,
        minutes,
        cost: railFare(km, line.operator),
        lineId: line.id,
      });
    }
  }
  return result;
}
const railEdges = railLines.flatMap(railEdgesFor);
// All place-to-place routes are now resolved through this walking + railway graph.
export const edges: Edge[] = [
  ...localWalkEdges,
  ...accessEdges,
  ...transferEdges,
  ...railEdges,
];
export type Food = {
  name: string;
  price: number;
  /** Base selection weight. Local specialties are 1; everyday chains are lower. */
  weight: number;
  /** Local (JST) opening window. closeHour may be 24 for all-day service. */
  openHour: number;
  closeHour: number;
  slots: string[];
  preference: Personality[];
  diary: string;
  image?: string;
};
export const foods: Food[] = [
  {
    name: "豚骨ラーメン",
    price: 800,
    weight: 1,
    openHour: 10,
    closeHour: 22,
    slots: ["lunch", "dinner"],
    preference: ["foodie"],
    diary:
      "スープをひと口。おいしくて、思わず耳がぴんとしたよ。福岡に来てよかった！",
    image: "ramen",
  },
  {
    name: "ごぼう天うどん",
    price: 550,
    weight: 1,
    openHour: 10,
    closeHour: 21,
    slots: ["lunch", "dinner"],
    preference: ["frugal"],
    diary:
      "やわらかいうどんと、さくさくのごぼう天。お財布にやさしくて、おなかもぽかぽか。",
  },
  {
    name: "もつ鍋",
    price: 2100,
    weight: 1,
    openHour: 17,
    closeHour: 22,
    slots: ["dinner"],
    preference: ["foodie"],
    diary:
      "今日はちょっとぜいたく。お鍋を囲むだけで、ひとり旅もあたたかくなるね。",
  },
  {
    name: "水炊き",
    price: 2400,
    weight: 1,
    openHour: 17,
    closeHour: 22,
    slots: ["dinner"],
    preference: ["foodie"],
    diary:
      "白いスープに、おいしさがぎゅっと詰まっていたよ。最後まで、大事にいただきました。",
  },
  {
    name: "明太子のおにぎり",
    price: 350,
    weight: 1,
    openHour: 7,
    closeHour: 21,
    slots: ["breakfast", "lunch", "dinner"],
    preference: ["frugal", "rail"],
    diary:
      "おにぎりを持って、ベンチでひと休み。ちょっとぴりっとするのが、好きなんだ。",
  },
  {
    name: "焼き鳥",
    price: 1200,
    weight: 1,
    openHour: 17,
    closeHour: 23,
    slots: ["dinner"],
    preference: ["foodie"],
    diary: "炭の香りに誘われて、つい寄り道。キャベツも一緒に、いただきます。",
  },
  {
    name: "ごまさば定食",
    price: 1600,
    weight: 1,
    openHour: 11,
    closeHour: 21,
    slots: ["lunch", "dinner"],
    preference: ["foodie"],
    diary: "ごまの香りと、新鮮なお魚。ごはんがどんどん進んじゃったよ。",
  },
  {
    name: "たまごサンド",
    price: 450,
    weight: 1,
    openHour: 7,
    closeHour: 15,
    slots: ["breakfast", "lunch"],
    preference: ["cyclist"],
    diary: "ふわふわのたまごサンドで、元気をチャージ。今日もいっぱい歩こう。",
  },
  {
    name: "クロワッサン",
    price: 500,
    weight: 1,
    openHour: 7,
    closeHour: 11,
    slots: ["breakfast"],
    preference: ["foodie"],
    diary: "焼きたてのクロワッサンで朝ごはん。今日の地図を広げる、この時間が好き。",
  },
  {
    name: "明太フランス",
    price: 450,
    weight: 1,
    openHour: 7,
    closeHour: 18,
    slots: ["breakfast", "lunch"],
    preference: ["foodie", "frugal"],
    diary: "明太子の塩気と香ばしいパン。ひと口で、旅の元気が出てきたよ。",
  },
  {
    name: "おむすび朝ごはん",
    price: 350,
    weight: 1,
    openHour: 7,
    closeHour: 11,
    slots: ["breakfast"],
    preference: ["frugal"],
    diary:
      "朝は小さなおむすびから。おこづかいを大事にしながら、今日も楽しむよ。",
  },
  {
    name: "焼きカレー",
    price: 1100,
    weight: 1,
    openHour: 11,
    closeHour: 21,
    slots: ["lunch", "dinner"],
    preference: ["rail"],
    diary: "こんがりチーズの下に、あつあつのカレー。ふうふうしながら食べたよ。",
  },
  {
    name: "海鮮丼",
    price: 1800,
    weight: 1,
    openHour: 11,
    closeHour: 15,
    slots: ["lunch"],
    preference: ["foodie", "cyclist"],
    diary:
      "海鮮がぎゅっと詰まった丼。ひと口ごとに、うれしくなるね。小さなぜいたく、ありがとう。",
  },
  {
    name: "コンビニ弁当",
    price: 500,
    weight: 0.35,
    openHour: 0,
    closeHour: 24,
    slots: ["breakfast", "lunch", "dinner"],
    preference: ["frugal", "rail"],
    diary:
      "今日は気軽にコンビニ弁当。買ったらすぐ食べられるのも、旅の味方だね。",
  },
  {
    name: "牛丼",
    price: 650,
    weight: 0.35,
    openHour: 5,
    closeHour: 24,
    slots: ["lunch", "dinner"],
    preference: ["frugal"],
    diary:
      "あつあつの牛丼を、ぱぱっといただきます。おなかいっぱい、もうひと歩きできそう。",
  },
  {
    name: "ハンバーガー",
    price: 700,
    weight: 0.3,
    openHour: 7,
    closeHour: 24,
    slots: ["breakfast", "lunch", "dinner"],
    preference: [],
    diary:
      "ハンバーガーを片手にひと休み。いつもの味があると、旅先でもほっとするね。",
  },
];
export const hotels = [
  { name: "ネットカフェ", price: 2500 },
  { name: "駅前のシンプルな宿", price: 4500 },
  { name: "静かな通りのホテル", price: 5400 },
  { name: "ゆったりした街のホテル", price: 6500 },
  { name: "窓辺のあるホテル", price: 7200 },
  { name: "野宿", price: 0 },
];
