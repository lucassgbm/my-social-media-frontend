"use client";

import { useCallback, useEffect, useId, useRef } from "react";
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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }

      // Focus trap: Tab circula apenas entre os elementos do modal.
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
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Bloqueia o scroll do body enquanto o modal está aberto.
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleKeyDown);

    // Move o foco para dentro do modal.
    const firstFocusable =
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    (firstFocusable ?? panelRef.current)?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
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
        <div className="flex justify-between items-center mb-4">
          <h2 id={titleId} className="text-lg font-semibold text-content">
            {title}
          </h2>

          <Button onClick={onClose} aria-label="Fechar">
            <CloseIcon className="size-6" />
          </Button>
        </div>

        {children}
      </div>
    </div>
  );
}
