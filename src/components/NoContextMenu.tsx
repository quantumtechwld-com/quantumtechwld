"use client";

import { useEffect } from "react";

const BLOCKED_KEYS = new Set(["F12", "F11"]);

function isDevToolsShortcut(e: KeyboardEvent): boolean {
  // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools panels)
  if (e.ctrlKey && e.shiftKey && ["i", "I", "j", "J", "c", "C"].includes(e.key)) return true;
  // Ctrl+U (view source)
  if (e.ctrlKey && ["u", "U"].includes(e.key)) return true;
  // F12, F11
  if (BLOCKED_KEYS.has(e.key)) return true;
  return false;
}

/**
 * Desabilita clique direito e atalhos de teclado do DevTools.
 * Ativo apenas em produção — em desenvolvimento fica completamente inerte.
 * Monitor: verificar se interfere com leitores de tela ou navegação por teclado.
 */
export default function NoContextMenu() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    const onContext = (e: MouseEvent) => e.preventDefault();
    const onKeydown = (e: KeyboardEvent) => {
      if (isDevToolsShortcut(e)) e.preventDefault();
    };

    document.addEventListener("contextmenu", onContext);
    document.addEventListener("keydown", onKeydown);
    return () => {
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("keydown", onKeydown);
    };
  }, []);

  return null;
}
