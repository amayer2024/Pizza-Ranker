import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE = "pr_gate";

export async function GET() {
  const pin = process.env.HOUSEHOLD_PIN?.trim() ?? "";
  if (!pin) return NextResponse.json({ required: false, unlocked: true });
  const jar = await cookies();
  return NextResponse.json({
    required: true,
    unlocked: jar.get(COOKIE)?.value === "ok",
  });
}

export async function POST(request: Request) {
  const pin = process.env.HOUSEHOLD_PIN?.trim() ?? "";
  if (!pin) return NextResponse.json({ required: false, unlocked: true });

  const body = (await request.json().catch(() => ({}))) as { pin?: string };
  if ((body.pin ?? "").trim() !== pin) {
    return NextResponse.json({ ok: false, error: "PIN incorrecto" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, unlocked: true });
  res.cookies.set(COOKIE, "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
