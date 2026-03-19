"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => globalThis.print()}
      className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400 print:hidden"
    >
      Imprimir / Guardar PDF
    </button>
  );
}
