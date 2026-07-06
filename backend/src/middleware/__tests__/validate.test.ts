import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import type { Request, Response } from "express";
import { validate } from "../validate.js";

function mockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("validate middleware", () => {
  const schema = z.object({
    price: z.number().nonnegative("Цена не может быть отрицательной"),
  });

  it("calls next() and normalizes req.body when the payload is valid", () => {
    const req = { body: { price: 100 } } as Request;
    const res = mockRes();
    const next = vi.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.body).toEqual({ price: 100 });
  });

  it("responds 400 with the first Zod issue message and does not call next()", () => {
    const req = { body: { price: -5 } } as Request;
    const res = mockRes();
    const next = vi.fn();

    validate(schema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Цена не может быть отрицательной",
    });
  });
});
