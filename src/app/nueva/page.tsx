import { Suspense } from "react";
import { NuevaScreen } from "@/components/screens/Nueva";

export default function Page() {
  return (
    <Suspense fallback={<div className="pad-block">Cargando…</div>}>
      <NuevaScreen />
    </Suspense>
  );
}
