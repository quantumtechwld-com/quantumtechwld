"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => globalThis.print()}
      className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light print:hidden"
    >
      Imprimir / Guardar PDF
    </button>
  );
}
