import { buildSync } from "esbuild";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import fs from "node:fs";
fs.mkdirSync(".sites-runtime", { recursive: true });
buildSync({
  entryPoints: ["lib/simulation.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: ".sites-runtime/simulation.cjs",
});
const require = createRequire(import.meta.url);
const {
  createTrip,
  advance,
  fund,
  currentPosition,
  getRoute,
  routeCost,
  routeMinutes,
  HOUR,
  DAY,
} = require("../.sites-runtime/simulation.cjs");
let cases = 0;
for (const days of [3, 7])
  for (const budget of [7000, 10000, 30000])
    for (const personality of ["foodie", "frugal", "rail", "cyclist"])
      for (const hour of [0, 8, 13, 20, 23])
        for (const seed of [1, 51, 773]) {
          const start = Date.UTC(2026, 8, 14, hour) - 9 * HOUR;
          const t = createTrip("test", days, budget, personality, start, seed);
          try {
            advance(t, start + days * DAY);
          } catch (e) {
            console.error({
              days,
              budget,
              personality,
              hour,
              seed,
              balance: t.balance,
              place: t.placeId,
              last: t.entries.slice(-5),
            });
            throw e;
          }
          assert.equal(
            t.status,
            "completed",
            `not completed ${days}/${budget}/${personality}/${hour}/${seed}`,
          );
          assert.equal(t.placeId, "hakata");
          assert(t.completedAt <= t.deadline, "returned after deadline");
          assert(t.entries.every((e) => e.balance >= 0));
          assert.equal(
            t.balance,
            days * budget - t.entries.reduce((s, e) => s + e.amount, 0),
          );
          assert(
            t.entries.every((e) => e.placeId !== "canal"),
            "removed canal destination was selected",
          );
          assert.equal(
            new Set(t.entries.map((e) => e.id)).size,
            t.entries.length,
          );
          assert(
            t.entries.every(
              (e, i) => i === 0 || e.time >= t.entries[i - 1].time,
            ),
          );
          const incremental = createTrip(
            "test",
            days,
            budget,
            personality,
            start,
            seed,
          );
          for (let offset = HOUR; offset <= days * DAY; offset += HOUR)
            advance(incremental, start + offset);
          assert.deepEqual(incremental, t, "opening frequency changed journey");
          const json = JSON.stringify(t);
          advance(t, start + days * DAY);
          assert.equal(JSON.stringify(t), json);
          cases++;
        }
const start = Date.UTC(2026, 8, 14, 0);
const t = createTrip("sponsor", 3, 10000, "foodie", start, 999);
fund(t, 3000, "one", start);
fund(t, 3000, "one", start);
assert.equal(t.balance, 33000);
assert.equal(t.totalBudget, 33000);
advance(t, start + HOUR);
const p = currentPosition(t, start + HOUR);
assert(p.every(Number.isFinite));
for (const [from, to] of [
  ["hakata", "nishijin"],
  ["hakata", "hakata-temple"],
  ["hakata", "hakata-mall"],
  ["hakata", "dome"],
  ["hakata", "itoshima"],
  ["hakata", "dazaifu"],
  ["hakata", "uminaka"],
  ["futami", "hakata"],
]) {
  const route = getRoute(from, to, "foodie");
  assert(route.length > 0, `route missing ${from}/${to}`);
  assert(route.every((leg) => leg.mode === "walk" || leg.mode === "train"));
  assert(route.every((leg) => leg.minutes > 0 && leg.cost >= 0));
  assert(routeMinutes(route) > 0);
  assert(routeCost(route) >= 0);
}
console.log(
  `${cases} trips passed: all return on time, no negative balances, ledger reconciliation, identical catch-up, idempotency; sponsorship, position, and walk/train route data passed.`,
);
