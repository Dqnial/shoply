import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import crypto from "crypto";
import app from "../../app.js";
import User from "../../models/User.js";
import Product from "../../models/Product.js";
import Order from "../../models/Order.js";
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

async function createAuthedUser(overrides: Partial<{ balance: number }> = {}) {
  const user = await User.create({
    name: "Test Buyer",
    email: `buyer-${Date.now()}-${Math.random()}@example.com`,
    password: "password123",
    balance: 0,
    ...overrides,
  });
  const csrf = generateCsrfToken();
  const cookie = `jwt=${generateToken(user._id.toString())}; csrf-token=${csrf}`;
  return { user, cookie, csrf };
}

function createProduct(overrides: Partial<{ price: number; countInStock: number }> = {}) {
  return Product.create({
    name: "Real Product",
    image: "/uploads/real.png",
    brand: "Brand",
    category: "Category",
    description: "desc",
    price: 50000,
    countInStock: 5,
    ...overrides,
  });
}

function buildOrderPayload(productId: string, overrides: Record<string, unknown> = {}) {
  return {
    orderItems: [
      { name: "x", qty: 1, image: "/x.png", price: 1, product: productId },
    ],
    shippingAddress: { address: "A", city: "B" },
    paymentMethod: "Balance",
    idempotencyKey: crypto.randomUUID(),
    ...overrides,
  };
}

describe("POST /api/orders", () => {
  it("recomputes totalPrice/name/price from the DB, ignoring client-supplied values", async () => {
    const { user, cookie, csrf } = await createAuthedUser({ balance: 1_000_000 });
    const product = await createProduct({ price: 50000, countInStock: 5 });

    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", cookie)
      .set("X-CSRF-Token", csrf)
      .send(
        buildOrderPayload(product._id.toString(), {
          orderItems: [
            {
              name: "HACKED",
              qty: 2,
              image: "/hack.png",
              price: 1,
              product: product._id.toString(),
            },
          ],
          totalPrice: 1,
        })
      );

    expect(res.status).toBe(201);
    expect(res.body.totalPrice).toBe(100000);
    expect(res.body.orderItems[0].price).toBe(50000);
    expect(res.body.orderItems[0].name).toBe("Real Product");

    const updatedUser = await User.findById(user._id);
    expect(updatedUser?.balance).toBe(900000);

    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct?.countInStock).toBe(3);
  });

  it("rejects the order and leaves stock untouched when quantity exceeds stock", async () => {
    const { cookie, csrf } = await createAuthedUser({ balance: 1_000_000 });
    const product = await createProduct({ price: 1000, countInStock: 1 });

    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", cookie)
      .set("X-CSRF-Token", csrf)
      .send(
        buildOrderPayload(product._id.toString(), {
          orderItems: [
            { name: "x", qty: 5, image: "/x.png", price: 1, product: product._id.toString() },
          ],
        })
      );

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/недостаточно на складе/);

    const unchanged = await Product.findById(product._id);
    expect(unchanged?.countInStock).toBe(1);
  });

  it("rejects the order when the user's balance is insufficient and rolls stock back", async () => {
    const { cookie, csrf } = await createAuthedUser({ balance: 10 });
    const product = await createProduct({ price: 5000, countInStock: 10 });

    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", cookie)
      .set("X-CSRF-Token", csrf)
      .send(buildOrderPayload(product._id.toString()));

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Недостаточно средств/);

    const unchanged = await Product.findById(product._id);
    expect(unchanged?.countInStock).toBe(10);
  });

  it("returns 401 without a valid auth cookie", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ orderItems: [], shippingAddress: {}, paymentMethod: "Balance" });

    expect(res.status).toBe(401);
  });

  it("returns 403 when the CSRF header is missing or doesn't match the cookie", async () => {
    const { cookie } = await createAuthedUser({ balance: 1_000_000 });
    const product = await createProduct();
    const payload = buildOrderPayload(product._id.toString());

    const missingHeader = await request(app)
      .post("/api/orders")
      .set("Cookie", cookie)
      .send(payload);
    expect(missingHeader.status).toBe(403);

    const mismatchedHeader = await request(app)
      .post("/api/orders")
      .set("Cookie", cookie)
      .set("X-CSRF-Token", "not-the-right-token")
      .send(payload);
    expect(mismatchedHeader.status).toBe(403);

    const unchanged = await Product.findById(product._id);
    expect(unchanged?.countInStock).toBe(5);
  });

  it("returns 400 when idempotencyKey is missing", async () => {
    const { cookie, csrf } = await createAuthedUser({ balance: 1_000_000 });
    const product = await createProduct();
    const payload = buildOrderPayload(product._id.toString());
    delete (payload as { idempotencyKey?: string }).idempotencyKey;

    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", cookie)
      .set("X-CSRF-Token", csrf)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/idempotencyKey/);
  });

  describe("idempotency (retry / double-click / flaky network protection)", () => {
    it("returns the same order and does not double-charge when the same key is sent twice", async () => {
      const { user, cookie, csrf } = await createAuthedUser({ balance: 1_000_000 });
      const product = await createProduct({ price: 50000, countInStock: 5 });
      const payload = buildOrderPayload(product._id.toString(), {
        orderItems: [
          { name: "x", qty: 1, image: "/x.png", price: 1, product: product._id.toString() },
        ],
      });

      const first = await request(app)
        .post("/api/orders")
        .set("Cookie", cookie)
        .set("X-CSRF-Token", csrf)
        .send(payload);
      expect(first.status).toBe(201);

      // Simulates the client retrying after a dropped response, or a second
      // click that raced past the disabled-button guard — same key, same body.
      const retry = await request(app)
        .post("/api/orders")
        .set("Cookie", cookie)
        .set("X-CSRF-Token", csrf)
        .send(payload);

      expect(retry.status).toBe(200);
      expect(retry.body._id).toBe(first.body._id);

      const orderCount = await Order.countDocuments({ user: user._id });
      expect(orderCount).toBe(1);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.balance).toBe(950000); // charged once, not twice

      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct?.countInStock).toBe(4); // decremented once, not twice
    });

    it("a genuinely failed attempt leaves no order behind, so a later retry (new key) can succeed", async () => {
      const { user, cookie, csrf } = await createAuthedUser({ balance: 10 });
      const product = await createProduct({ price: 5000, countInStock: 10 });

      const failed = await request(app)
        .post("/api/orders")
        .set("Cookie", cookie)
        .set("X-CSRF-Token", csrf)
        .send(buildOrderPayload(product._id.toString()));
      expect(failed.status).toBe(400);

      // User tops up their balance, then retries with a brand-new key (a new
      // checkout attempt) — the failed attempt never committed an Order, so
      // this must go through rather than being treated as a duplicate.
      await User.findByIdAndUpdate(user._id, { balance: 1_000_000 });

      const succeeded = await request(app)
        .post("/api/orders")
        .set("Cookie", cookie)
        .set("X-CSRF-Token", csrf)
        .send(buildOrderPayload(product._id.toString()));

      expect(succeeded.status).toBe(201);

      const orderCount = await Order.countDocuments({ user: user._id });
      expect(orderCount).toBe(1);
    });
  });
});
