import { NextResponse } from "next/server";

/** Định dạng lỗi chung theo contracts/api.md: { error: { code, message } } */
export function apiError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}
