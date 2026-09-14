import assert from "node:assert/strict";
const base = "http://localhost:5180";
let cookie = "";
async function request(body, id, origin) {
  const res = await fetch(base + "/api/trip" + (id ? "?id=" + id : ""), {
    method: body ? "POST" : "GET",
    headers: {
      ...(cookie ? { cookie } : {}),
      ...(body ? { "content-type": "application/json" } : {}),
      ...(origin ? { origin } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  cookie = res.headers.get("set-cookie")?.split(";")[0] ?? cookie;
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: text };
  }
  return { status: res.status, data };
}
assert.equal((await request()).data.trip, null);
const startId = crypto.randomUUID();
const start = {
  action: "start",
  requestId: startId,
  days: 3,
  dailyBudget: 7000,
  personality: "frugal",
};
const first = await request(start);
assert.equal(first.status, 200);
assert.equal(first.data.trip.balance, 21000);
assert.equal((await request(start)).data.trip.id, startId);
assert.equal(
  (await request({ ...start, requestId: crypto.randomUUID() })).status,
  409,
);
const fund = {
  action: "fund",
  requestId: crypto.randomUUID(),
  tripId: startId,
  amount: 3000,
};
const concurrent = await Promise.all([
  request(fund),
  request(fund),
  request(undefined, startId),
]);
assert(concurrent.every((r) => r.status === 200));
const read = await request();
assert.equal(read.data.trip.balance, 24000);
assert.equal(
  read.data.trip.entries.filter((e) => e.category === "funding").length,
  1,
);
assert.equal(
  (await request({ ...fund, requestId: crypto.randomUUID(), amount: -1000 }))
    .status,
  400,
);
assert.equal(
  (
    await request({
      ...start,
      requestId: crypto.randomUUID(),
      personality: "__proto__",
    })
  ).status,
  400,
);
assert.equal(
  (
    await request(
      { ...fund, requestId: crypto.randomUUID() },
      undefined,
      "https://example.org",
    )
  ).status,
  403,
);
const advance = {
  action: "advance",
  requestId: crypto.randomUUID(),
  tripId: startId,
  hours: 24,
};
const one = await request(advance);
assert.equal(one.status, 200);
const twice = await request(advance);
assert.equal(twice.data.trip.offsetMs, one.data.trip.offsetMs);
assert.equal(twice.data.trip.entries.length, one.data.trip.entries.length);
await request({ ...advance, requestId: crypto.randomUUID() });
const complete = await request({ ...advance, requestId: crypto.randomUUID() });
assert.equal(complete.data.trip.status, "completed");
assert.equal(complete.data.trip.placeId, "hakata");
const second = await request({
  ...start,
  requestId: crypto.randomUUID(),
  personality: "foodie",
});
assert.equal(second.status, 200);
assert.equal(second.data.history.length, 2);
assert.equal((await request(undefined, startId)).data.trip.status, "completed");
cookie = "";
assert.equal((await request(undefined, startId)).data.trip, null);
console.log(
  "API passed: saved state, single active trip, concurrent idempotent funding, input validation, cross-origin rejection, time advance retry, return, retained history, session isolation.",
);
