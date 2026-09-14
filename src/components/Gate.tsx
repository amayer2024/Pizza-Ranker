"use client";

import { useEffect, useState } from "react";
import { readGateUnlocked, writeGateUnlocked } from "@/lib/identity";
import { USERS } from "@/lib/types";
import { usePizza } from "./PizzaProvider";

export function Gate({ children }: { children: React.ReactNode }) {
  const { user, setUser, ready } = usePizza();
  const [pinRequired, setPinRequired] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/gate")
      .then((r) => r.json())
      .then((data: { required: boolean; unlocked: boolean }) => {
        if (cancelled) return;
        setPinRequired(data.required);
        setUnlocked(!data.required || data.unlocked || readGateUnlocked());
      })
      .catch(() => {
        if (!cancelled) setUnlocked(true);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function submitPin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/gate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) {
      setError("PIN incorrecto.");
      return;
    }
    writeGateUnlocked();
    setUnlocked(true);
  }

  if (!ready || checking) {
    return (
      <div className="gate">
        <div className="kicker">Madrid · piso 3ºB</div>
        <h1>PIZZA RANK</h1>
        <p className="text-muted">Cargando el ranking…</p>
      </div>
    );
  }

  if (pinRequired && !unlocked) {
    return (
      <div className="gate">
        <div className="kicker">Madrid · piso 3ºB</div>
        <h1>PIZZA RANK</h1>
        <p>El piso tiene un PIN. Ponlo una vez por sesión.</p>
        <form onSubmit={submitPin}>
          <div className="field">
            <label htmlFor="pin">PIN del piso</label>
            <input
              id="pin"
              className="input"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />
          </div>
          <button className="btn btn-primary btn-block" type="submit">
            Entrar
          </button>
          {error ? <p style={{ color: "var(--color-accent-700)", fontWeight: 700 }}>{error}</p> : null}
        </form>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="gate">
        <div className="kicker">Madrid · piso 3ºB</div>
        <h1>PIZZA RANK</h1>
        <p>Quién eres. Se recuerda en este teléfono.</p>
        <div className="user-row" style={{ marginTop: 16 }}>
          {USERS.map((u) => (
            <button key={u} className="chip" onClick={() => setUser(u)}>
              {u}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
