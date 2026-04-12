"use client";

/**
 * LordiconPlayer — wrapper React para @lordicon/element
 *
 * Uso:
 *   import LordiconPlayer from "@/components/ui/LordiconPlayer";
 *   import iconJson from "@/icons/lordicon/zap.json";
 *
 *   <LordiconPlayer icon={iconJson} trigger="loop-on-hover" size={48} />
 *
 * Obter ícones: https://lordicon.com  → Download → JSON (Lottie)
 * Guardar em:  src/icons/lordicon/<nome>.json
 *
 * Triggers disponíveis:
 *   "hover" | "loop" | "loop-on-hover" | "click" | "morph" | "none"
 *
 * Colors format: "primary:#9B59FF,secondary:#22D4C2"
 */

import { useEffect, useRef } from "react";

// ── Tipo para o custom element <lord-icon> ───────────────────────────────────
interface LordIconElement extends React.HTMLAttributes<HTMLElement> {
  src?: string;
  trigger?: string;
  colors?: string;
  stroke?: string;
  state?: string;
  target?: string;
  style?: React.CSSProperties;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace React {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
      interface IntrinsicElements {
        "lord-icon": LordIconElement;
      }
    }
  }
}

// evitar registo duplo em HMR
let elementDefined = false;

export interface LordiconPlayerProps {
  /** JSON do ícone Lordicon (importado directamente do ficheiro .json) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: Record<string, any>;
  /** Comportamento de animação */
  trigger?: "hover" | "loop" | "loop-on-hover" | "click" | "morph" | "none";
  /** Tamanho em px (width = height) */
  size?: number;
  /**
   * Cores no formato Lordicon: "primary:#9B59FF,secondary:#22D4C2"
   * Consultár camadas disponíveis no site lordicon.com
   */
  colors?: string;
  /** Espessura do traço (0–100). Apenas ícones "Wired". Default: 60 */
  stroke?: string;
  className?: string;
}

export default function LordiconPlayer({
  icon,
  trigger = "hover",
  size = 48,
  colors,
  stroke = "60",
  className,
}: Readonly<LordiconPlayerProps>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (globalThis.window === undefined) return;

    (async () => {
      if (!elementDefined && !customElements.get("lord-icon")) {
        const { defineElement } = await import("@lordicon/element");
        defineElement();
        elementDefined = true;
      }

      // injectar o JSON do ícone no elemento após registo
      const el = containerRef.current?.querySelector("lord-icon");
      if (el && icon) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (el as any).icon = icon;
      }
    })();
  }, [icon]);

  return (
    <div ref={containerRef} className={className} style={{ width: size, height: size }}>
      <lord-icon
        trigger={trigger}
        colors={colors}
        stroke={stroke}
        style={{ width: size, height: size, display: "block" }}
      />
    </div>
  );
}
