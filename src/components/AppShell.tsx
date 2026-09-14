"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { USERS } from "@/lib/types";
import { usePizza } from "./PizzaProvider";

const MOBILE_TABS = [
  { href: "/", label: "Ranking", match: (p: string) => p === "/" || p.startsWith("/sitio/") },
  { href: "/compara", label: "Comparar", match: (p: string) => p === "/compara" },
  { href: "/nueva", label: "+", match: (p: string) => p === "/nueva" || p === "/nuevo-sitio", plus: true },
  { href: "/mapa", label: "Mapa", match: (p: string) => p === "/mapa" },
  { href: "/stats", label: "Stats", match: (p: string) => p === "/stats" },
];

const DESKTOP_NAV = [
  { href: "/", label: "Ranking" },
  { href: "/nueva", label: "Nueva valoración" },
  { href: "/compara", label: "Comparar" },
  { href: "/mapa", label: "Mapa" },
  { href: "/stats", label: "Estadísticas" },
  { href: "/nuevo-sitio", label: "Nuevo sitio" },
];

export function AppShell({
  kicker,
  title,
  backHref,
  children,
}: {
  kicker: string;
  title: string;
  backHref?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { lens, setLens, user, setUser } = usePizza();
  const lensOptions = (["Todos", ...USERS] as const);

  function LensButtons() {
    return (
      <>
        {lensOptions.map((u) => (
          <button key={u} className={lens === u ? "is-on" : ""} onClick={() => setLens(u)}>
            {u === "Todos" ? "Combinada" : u}
          </button>
        ))}
      </>
    );
  }

  return (
    <div className="page-shell">
      <aside className="side-nav desktop-only">
        <div className="side-brand">PIZZA RANK</div>
        {DESKTOP_NAV.map((n) => {
          const on =
            n.href === "/"
              ? pathname === "/" || pathname.startsWith("/sitio/")
              : pathname === n.href;
          return (
            <Link key={n.href} href={n.href} className={on ? "is-on" : ""}>
              {n.label}
            </Link>
          );
        })}
        <div className="side-people">
          <div className="kicker" style={{ marginBottom: 8 }}>
            Piso
          </div>
            {USERS.map((u) => (
              <div key={u} className="person">
                <span className="avatar">{u[0]}</span>
                {u}
                {user === u ? " · tú" : ""}
              </div>
            ))}
            <button className="linkish" onClick={() => setUser(null)} style={{ marginTop: 8 }}>
              Cambiar de persona
            </button>
        </div>
      </aside>

      <div className="page-main">
        <header className="mobile-header mobile-only">
          <div>
            <div className="kicker">{kicker}</div>
            <h1>{title}</h1>
          </div>
          {backHref ? (
            <Link className="btn-back" href={backHref}>
              Volver
            </Link>
          ) : (
            <button className="btn-back" type="button" onClick={() => setUser(null)}>
              {user}
            </button>
          )}
        </header>
        <div className="lens-row mobile-only">
          <LensButtons />
        </div>
        <div className="desktop-head desktop-only">
          <div>
            <div className="kicker">{kicker}</div>
            <h1>{title}</h1>
          </div>
          <div className="desktop-head-tools">
            <div className="lens-box">
              <LensButtons />
            </div>
            <Link href="/nueva" className="btn btn-primary">
              Nueva valoración
            </Link>
          </div>
        </div>
        <div className="app-content">{children}</div>
        <nav className="bottom-tabs mobile-only">
          {MOBILE_TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`${t.match(pathname) ? "is-on" : ""} ${t.plus ? "tab-plus" : ""}`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
