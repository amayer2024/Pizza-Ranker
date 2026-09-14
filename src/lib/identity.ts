import { USERS, type UserName } from "./types";

const USER_KEY = "pizza-rank:user";
const GATE_KEY = "pizza-rank:gate";

export function readUser(): UserName | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(USER_KEY);
  return USERS.includes(v as UserName) ? (v as UserName) : null;
}

export function writeUser(user: UserName) {
  localStorage.setItem(USER_KEY, user);
}

export function readGateUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(GATE_KEY) === "1";
}

export function writeGateUnlocked() {
  sessionStorage.setItem(GATE_KEY, "1");
}
