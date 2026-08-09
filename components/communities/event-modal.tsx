'use client';

import { useRef, useState } from "react";
import Modal from "../modal";
import Input from "../input";
import Textarea from "../textarea";
import Button from "../button";
import FormButtom from "../form-buttom";
import PhotoIcon from "../icons/photo";
import { postFormData } from "@/api/services/request";
import { useToaster } from "../../providers/toaster-provider";
import type { CommunityEvent } from "../../utils/community";

type EventModalProps = {
    isOpen: boolean;
    onClose: () => void;
    communityId: number | string;
    onCreated: (event: CommunityEvent) => void;
};

type EventForm = {
    title: string;
    description: string;
    local: string;
    link: string;
    date_start: string;
    date_end: string;
    time_start: string;
    time_end: string;
};

const EMPTY_FORM: EventForm = {
    title: "",
    description: "",
    local: "",
    link: "",
    date_start: "",
    date_end: "",
    time_start: "",
    time_end: "",
};

/** Cadastro de evento — a tela só mostra este modal para quem administra. */
export default function EventModal({ isOpen, onClose, communityId, onCreated }: EventModalProps) {
    const { showToast } = useToaster();

    const [form, setForm] = useState<EventForm>(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof EventForm, string>>>({});
    const [photo, setPhoto] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    function setField<K extends keyof EventForm>(field: K, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    }

    /** Espelha as regras do store() para evitar um 422 previsível. */
    function validate(): typeof errors {
        const found: typeof errors = {};

        if (form.title.trim() === "") found.title = "Informe o título";
        if (form.description.trim() === "") found.description = "Informe a descrição";
        if (form.local.trim() === "") found.local = "Informe o local";
        if (form.date_start === "") found.date_start = "Informe a data de início";
        if (form.date_end === "") found.date_end = "Informe a data de término";
        else if (form.date_start && form.date_end < form.date_start)
            found.date_end = "O término não pode ser antes do início";
        if (form.time_start === "") found.time_start = "Informe o horário de início";
        if (form.time_end === "") found.time_end = "Informe o horário de término";

        return found;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const found = validate();
        setErrors(found);

        if (Object.keys(found).length > 0) {
            showToast({ title: "Eventos", message: "Revise os campos destacados.", status: "error" });
            return;
        }

        setSaving(true);

        const formData = new FormData();
        (Object.keys(form) as (keyof EventForm)[]).forEach((field) => {
            // `link` é nullable|url no backend: string vazia reprovaria
            if (form[field] !== "") formData.append(field, form[field]);
        });
        if (photo) formData.append("photo", photo);

        try {
            const response = await postFormData(
                `/social-media/community/${communityId}/events`,
                formData
            );

            if (response?.errors || !response?.data) {
                showToast({ title: "Eventos", message: "Não foi possível cadastrar o evento.", status: "error" });
                return;
            }

            onCreated(response.data as CommunityEvent);

            setForm(EMPTY_FORM);
            setPhoto(null);
            if (inputRef.current) inputRef.current.value = "";
            onClose();

            showToast({ title: "Eventos", message: "Evento cadastrado!", status: "success" });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({
                title: "Eventos",
                message: error?.response?.data?.message ?? "Não foi possível cadastrar o evento.",
                status: "error",
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Novo evento" width="sm:w-[620px]">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <Input
                    label="Título"
                    placeholder="Nome do evento"
                    value={form.title}
                    error={errors.title}
                    onChange={(e) => setField("title", e.target.value)}
                />

                <Textarea
                    label="Descrição"
                    rows={3}
                    placeholder="O que vai acontecer?"
                    value={form.description}
                    error={errors.description}
                    onChange={(e) => setField("description", e.target.value)}
                />

                <Input
                    label="Local"
                    placeholder="Onde vai ser"
                    value={form.local}
                    error={errors.local}
                    onChange={(e) => setField("local", e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="Início"
                        type="date"
                        value={form.date_start}
                        error={errors.date_start}
                        onChange={(e) => setField("date_start", e.target.value)}
                    />
                    <Input
                        label="Término"
                        type="date"
                        value={form.date_end}
                        error={errors.date_end}
                        onChange={(e) => setField("date_end", e.target.value)}
                    />
                    <Input
                        label="Hora de início"
                        type="time"
                        value={form.time_start}
                        error={errors.time_start}
                        onChange={(e) => setField("time_start", e.target.value)}
                    />
                    <Input
                        label="Hora de término"
                        type="time"
                        value={form.time_end}
                        error={errors.time_end}
                        onChange={(e) => setField("time_end", e.target.value)}
                    />
                </div>

                <Input
                    label="Link (opcional)"
                    type="url"
                    placeholder="https://..."
                    value={form.link}
                    error={errors.link}
                    onChange={(e) => setField("link", e.target.value)}
                />

                <div className="flex flex-row flex-wrap items-center gap-2">
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                    />
                    <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                        <PhotoIcon className="size-4" />
                        {photo ? "Trocar imagem" : "Imagem do evento (opcional)"}
                    </Button>
                    {photo && <span className="text-xs text-content-muted truncate">{photo.name}</span>}
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <Button variant="ghost" size="md" onClick={onClose}>
                        Cancelar
                    </Button>
                    <FormButtom label="Cadastrar evento" type="submit" loading={saving} />
                </div>
            </form>
        </Modal>
    );
}
