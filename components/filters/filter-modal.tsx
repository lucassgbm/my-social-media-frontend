'use client';

import type { ReactNode } from "react";
import Modal from "../modal";
import Button from "../button";
import FormButtom from "../form-buttom";

type FilterModalProps = {
    isOpen: boolean;
    onClose: () => void;
    /** Aplica o rascunho: a lista só muda quando se confirma. */
    onApply: () => void;
    /** Zera os campos sem fechar — quem decide é o botão de aplicar. */
    onClear: () => void;
    title?: string;
    children: ReactNode;
};

/**
 * Modal de filtros das listagens (pessoas, comunidades, eventos).
 *
 * Trabalha sobre um rascunho: mexer nos campos não refaz a lista atrás do
 * modal, e "Aplicar" é o que confirma. Os três lugares seguem o mesmo formato
 * para o botão de filtro significar sempre a mesma coisa.
 */
export default function FilterModal({
    isOpen,
    onClose,
    onApply,
    onClear,
    title = "Filtros",
    children,
}: FilterModalProps) {
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onApply();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} width="sm:w-[520px]">
            {/* <form> para o Enter no campo de busca aplicar os filtros */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {children}

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-line pt-4">
                    <Button variant="ghost" size="md" className="sm:mr-auto" onClick={onClear}>
                        Limpar tudo
                    </Button>

                    <Button variant="secondary" size="md" onClick={onClose}>
                        Cancelar
                    </Button>

                    <FormButtom label="Aplicar filtros" type="submit" />
                </div>
            </form>
        </Modal>
    );
}
