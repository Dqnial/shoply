import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Response } from "express";

const COOKIE_NAME = "jwt";
const CSRF_COOKIE_NAME = "csrf-token";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });
};

// httpOnly: JS on the page (and any XSS payload) can't read this cookie.
// sameSite "lax" stops it being sent on cross-site POST/PUT/DELETE requests,
// which covers most CSRF scenarios for a same-site frontend/backend setup.
export const setTokenCookie = (res: Response, token: string) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: THIRTY_DAYS_MS,
    path: "/",
  });
};

export const clearTokenCookie = (res: Response) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};

export const getTokenFromCookies = (
  cookies: Record<string, string> | undefined
): string | undefined => cookies?.[COOKIE_NAME];

export const generateCsrfToken = (): string => crypto.randomBytes(32).toString("hex");

// Deliberately NOT httpOnly — the frontend must be able to read this value
// via document.cookie and echo it back in a header (double-submit pattern).
// A cross-site attacker can trigger the request (cookie gets attached
// automatically) but can't read this cookie to forge a matching header,
// since it lives on our origin.
export const setCsrfCookie = (res: Response, token: string) => {
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: THIRTY_DAYS_MS,
    path: "/",
  });
};

export const clearCsrfCookie = (res: Response) => {
  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};

export const getCsrfFromCookies = (
  cookies: Record<string, string> | undefined
): string | undefined => cookies?.[CSRF_COOKIE_NAME];

// Sets both the session (httpOnly) cookie and its double-submit CSRF pair —
// call this on every login/register/profile-update so the two never drift.
export const setAuthCookies = (res: Response, userId: string) => {
  setTokenCookie(res, generateToken(userId));
  setCsrfCookie(res, generateCsrfToken());
};

export const clearAuthCookies = (res: Response) => {
  clearTokenCookie(res);
  clearCsrfCookie(res);
};
