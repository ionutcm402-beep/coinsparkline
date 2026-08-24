import { NextResponse } from "next/server";

export function apiError(message: string, status: number, code: string) {
  return NextResponse.json({ ok: false, error: message, code }, { status });
}

export function apiSuccess<T extends Record<string, unknown>>(payload: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, ...payload }, init);
}
