'use client';

import { useState } from "react";
import Modal from "../modal";
import Input from "../input";
import Textarea from "../textarea";
import Button from "../button";
import FormButtom from "../form-buttom";
import { post } from "@/api/services/request";
import { useToaster } from "../../providers/toaster-provider";
import type { CommunityTopic } from "../../utils/community";

type TopicModalProps = {
    isOpen: boolean;
    onClose: () => void;
    communityId: number | string;
    onCreated: (topic: CommunityTopic) => void;
};

const DESCRIPTION_MAX = 5000;

/** Abertura de tópico — a tela só mostra este modal para quem administra. */
export default function TopicModal({ isOpen, onClose, communityId, onCreated }: TopicModalProps) {
    const { showToast } = useToaster();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (title.trim() === "") {
            setError("Informe o título do tópico");
            return;
        }

        setSaving(true);

        const response = await post(`/social-media/community/${communityId}/topics`, {
            title,
            description,
        });

        setSaving(false);

        // post() devolve undefined quando a requisição falha
        if (!response?.data) {
            showToast({
                title: "Tópicos",
                message: "Não foi possível criar o tópico.",
                status: "error",
            });
            return;
        }

        onCreated(response.data as CommunityTopic);

        setTitle("");
        setDescription("");
        setError(null);
        onClose();

        showToast({ title: "Tópicos", message: "Tópico criado!", status: "success" });
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Novo tópico" width="sm:w-[560px]">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <Input
                    label="Título"
                    placeholder="Sobre o que é a conversa?"
                    value={title}
                    error={error ?? undefined}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        setError(null);
                    }}
                />

                <Textarea
                    label="Descrição (opcional)"
                    rows={5}
                    maxLength={DESCRIPTION_MAX}
                    placeholder="Dê o contexto para os membros"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <Button variant="ghost" size="md" onClick={onClose}>
                        Cancelar
                    </Button>
                    <FormButtom label="Criar tópico" type="submit" loading={saving} />
                </div>
            </form>
        </Modal>
    );
}
