import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    // Client-generated key for one checkout attempt — lets addOrderItems
    // collapse retries (flaky network, double-click, two tabs) into the
    // single order that actually got created, instead of charging twice.
    // sparse: true so older orders created before this field existed (no
    // key at all) don't collide with each other under the unique index.
    idempotencyKey: { type: String, unique: true, sparse: true },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String },
      country: { type: String },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Balance", "Card"],
      default: "Balance",
    },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    status: {
      type: String,
      required: true,
      enum: ["В обработке", "Оплачен", "Доставляется", "Завершен", "Отменен"],
      default: "В обработке",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
