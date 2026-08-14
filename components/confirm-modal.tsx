'use client';

import type { ReactNode } from "react";
import Modal from "./modal";
import Button from "./button";
import type { ButtonVariant } from "./button";

type ConfirmModalProps = {
    isOpen: boolean;
    /** Fechar sem confirmar: o X, o Esc, o fundo e o botão de cancelar. */
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    /** O que vai acontecer, em uma frase — quem confirma precisa saber o efeito. */
    description: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    /** `danger` para o que não tem desfazer óbvio. */
    confirmVariant?: ButtonVariant;
    /** Enquanto a requisição não volta, os dois botões travam. */
    pending?: boolean;
};

/**
 * Confirmação de uma ação só: título, o que ela faz e os dois botões.
 *
 * A ordem no mobile é invertida (`flex-col-reverse`) para que confirmar fique
 * embaixo, no alcance do polegar, e cancelar não seja o alvo mais fácil.
 */
export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    confirmVariant = "primary",
    pending = false,
}: ConfirmModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={pending ? () => { } : onClose}
            title={title}
            width="sm:w-[460px]"
        >
            <div className="flex flex-col gap-6">
                <p className="text-sm text-content-muted">{description}</p>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <Button variant="ghost" size="md" disabled={pending} onClick={onClose}>
                        {cancelLabel}
                    </Button>

                    <Button
                        variant={confirmVariant}
                        size="md"
                        disabled={pending}
                        onClick={onConfirm}
                        className="font-semibold"
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
