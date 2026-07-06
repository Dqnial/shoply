import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app.js";
import User from "../../models/User.js";
import { generateToken, generateCsrfToken } from "../../utils/token.js";
import { connectTestDB, disconnectTestDB, clearTestDB } from "../../test/db.js";

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  await connectTestDB();
}, 60000);

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

async function createUser(overrides: Partial<{ balance: number; isAdmin: boolean }> = {}) {
  const user = await User.create({
    name: "Test User",
    email: `user-${Date.now()}-${Math.random()}@example.com`,
    password: "password123",
    balance: 0,
    ...overrides,
  });
  const csrf = generateCsrfToken();
  const cookie = `jwt=${generateToken(user._id.toString())}; csrf-token=${csrf}`;
  return { user, cookie, csrf };
}

describe("PUT /api/users/balance/withdraw", () => {
  it("withdraws the amount and returns the new balance", async () => {
    const { user, cookie, csrf } = await createUser({ balance: 1000 });

    const res = await request(app)
      .put("/api/users/balance/withdraw")
      .set("Cookie", cookie)
      .set("X-CSRF-Token", csrf)
      .send({ amount: 300 });

    expect(res.status).toBe(200);
    expect(res.body.balance).toBe(700);

    const updated = await User.findById(user._id);
    expect(updated?.balance).toBe(700);
  });

  it("rejects withdrawal when funds are insufficient, leaving the balance untouched", async () => {
    const { user, cookie, csrf } = await createUser({ balance: 100 });

    const res = await request(app)
      .put("/api/users/balance/withdraw")
      .set("Cookie", cookie)
      .set("X-CSRF-Token", csrf)
      .send({ amount: 500 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Недостаточно средств/);

    const unchanged = await User.findById(user._id);
    expect(unchanged?.balance).toBe(100);
  });

  it("only allows one of two concurrent withdrawals when the balance can't cover both", async () => {
    // Balance covers exactly one 600 withdrawal, not two — this is the
    // read-modify-write race the atomic $inc + condition update protects
    // against (both requests reading the same starting balance and both
    // passing the "enough funds" check).
    const { user, cookie, csrf } = await createUser({ balance: 600 });

    const [first, second] = await Promise.all([
      request(app)
        .put("/api/users/balance/withdraw")
        .set("Cookie", cookie)
        .set("X-CSRF-Token", csrf)
        .send({ amount: 600 }),
      request(app)
        .put("/api/users/balance/withdraw")
        .set("Cookie", cookie)
        .set("X-CSRF-Token", csrf)
        .send({ amount: 600 }),
    ]);

    const statuses = [first.status, second.status].sort();
    expect(statuses).toEqual([200, 400]);

    const finalUser = await User.findById(user._id);
    expect(finalUser?.balance).toBe(0);
  });
});

describe("PUT /api/users/:id/balance (admin top-up)", () => {
  it("credits the target user's balance", async () => {
    const { cookie, csrf } = await createUser({ isAdmin: true });
    const target = await User.create({
      name: "Recipient",
      email: `recipient-${Date.now()}@example.com`,
      password: "password123",
      balance: 200,
    });

    const res = await request(app)
      .put(`/api/users/${target._id}/balance`)
      .set("Cookie", cookie)
      .set("X-CSRF-Token", csrf)
      .send({ amount: 300 });

    expect(res.status).toBe(200);
    expect(res.body.balance).toBe(500);

    const updated = await User.findById(target._id);
    expect(updated?.balance).toBe(500);
  });

  it("returns 403 for a non-admin user", async () => {
    const { cookie, csrf } = await createUser({ isAdmin: false });
    const target = await User.create({
      name: "Recipient",
      email: `recipient2-${Date.now()}@example.com`,
      password: "password123",
      balance: 200,
    });

    const res = await request(app)
      .put(`/api/users/${target._id}/balance`)
      .set("Cookie", cookie)
      .set("X-CSRF-Token", csrf)
      .send({ amount: 300 });

    expect(res.status).toBe(403);

    const unchanged = await User.findById(target._id);
    expect(unchanged?.balance).toBe(200);
  });
});
