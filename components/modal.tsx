"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./button";
import CloseIcon from "./icons/close";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/** O X do cabeçalho é o primeiro focável do DOM, mas é o pior lugar para começar. */
const DISMISS_ATTR = "data-modal-dismiss";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  width,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // `document` só existe depois da hidratação; sem esta trava o portal
  // quebraria a renderização no servidor
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // onClose costuma ser uma arrow inline no chamador, ou seja, muda de
  // identidade a cada render do pai. Guardá-la numa ref é o que permite os
  // efeitos abaixo dependerem só de `isOpen` — ver o comentário do foco.
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  /**
   * Foco inicial e trava de scroll: rodam uma vez por abertura.
   *
   * Este efeito também dependia de `handleKeyDown`, que dependia de `onClose`.
   * Como `onClose` mudava a cada render do pai, digitar uma letra em qualquer
   * campo re-executava o efeito e jogava o foco de volta no botão de fechar —
   * dava para digitar só um caractere por vez.
   */
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Prefere o primeiro campo/ação de conteúdo; o X só se não houver outro.
    const panel = panelRef.current;
    const items = Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    const target = items.find((el) => !el.hasAttribute(DISMISS_ATTR)) ?? items[0] ?? panel;

    target?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
      previouslyFocused.current?.focus();
    };
  }, [isOpen]);

  /** Esc fecha e Tab circula apenas dentro do modal. */
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key !== "Tab" || !panelRef.current) return;

      const items = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null);

      if (items.length === 0) {
        e.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  /**
   * Fora da árvore de quem abriu: o modal do botão de amizade nasce dentro do
   * <Link> do card, e daí qualquer clique nele — inclusive o de confirmar —
   * subia até a âncora e navegava para o perfil no meio da ação.
   */
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Fundo escuro — apenas decorativo, o fechamento por teclado é o Esc */}
      <div
        className="fixed inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={`w-full h-full flex flex-col sm:h-auto sm:max-h-[90vh] overflow-y-auto
          bg-surface text-content rounded-none sm:rounded-card shadow-xl p-6 z-10
          ${width ?? "sm:w-[600px]"}`}
      >
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 id={titleId} className="text-lg font-semibold text-content">
            {title}
          </h2>

          <Button onClick={onClose} aria-label="Fechar" data-modal-dismiss="">
            <CloseIcon className="size-6" />
          </Button>
        </div>

        {children}
      </div>
    </div>,
    document.body
  );
}
