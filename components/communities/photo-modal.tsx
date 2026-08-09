'use client';

import { useEffect, useRef, useState } from "react";
import Image from "../remote-image";
import Modal from "../modal";
import Input from "../input";
import Button from "../button";
import FormButtom from "../form-buttom";
import PhotoIcon from "../icons/photo";
import { postFormData } from "@/api/services/request";
import { useToaster } from "../../providers/toaster-provider";
import type { CommunityPhoto } from "../../utils/community";

type PhotoModalProps = {
    isOpen: boolean;
    onClose: () => void;
    communityId: number | string;
    onCreated: (photo: CommunityPhoto) => void;
};

/** Upload para a galeria — restrito a quem administra a comunidade. */
export default function PhotoModal({ isOpen, onClose, communityId, onCreated }: PhotoModalProps) {
    const { showToast } = useToaster();

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // revoga a URL anterior a cada troca de arquivo e no unmount
    useEffect(() => {
        if (!preview) return;
        return () => URL.revokeObjectURL(preview);
    }, [preview]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const chosen = e.target.files?.[0];
        if (!chosen) return;

        setFile(chosen);
        setPreview(URL.createObjectURL(chosen));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!file) {
            showToast({ title: "Fotos", message: "Escolha uma imagem.", status: "error" });
            return;
        }

        setSaving(true);

        const formData = new FormData();
        formData.append("photo", file);
        if (description) formData.append("description", description);

        try {
            const response = await postFormData(
                `/social-media/community/${communityId}/photos`,
                formData
            );

            // postFormData devolve { errors } no 422 em vez de lançar
            if (response?.errors || !response?.data) {
                showToast({ title: "Fotos", message: "Não foi possível enviar a foto.", status: "error" });
                return;
            }

            onCreated(response.data as CommunityPhoto);

            setFile(null);
            setPreview(null);
            setDescription("");
            if (inputRef.current) inputRef.current.value = "";
            onClose();

            showToast({ title: "Fotos", message: "Foto adicionada!", status: "success" });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({
                title: "Fotos",
                message: error?.response?.data?.message ?? "Não foi possível enviar a foto.",
                status: "error",
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Adicionar foto" width="sm:w-[560px]">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                />

                {preview ? (
                    <div className="relative w-full aspect-video overflow-hidden rounded-card">
                        <Image src={preview} alt="Pré-visualização" fill className="object-cover" />
                    </div>
                ) : (
                    <div className="flex w-full flex-col items-center justify-center gap-2 rounded-card
                        border border-dashed border-line py-10 text-center text-content-muted">
                        <PhotoIcon className="size-8" />
                        <span className="text-sm">Nenhuma foto selecionada</span>
                    </div>
                )}

                <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                    <PhotoIcon className="size-4" />
                    {file ? "Trocar imagem" : "Escolher imagem"}
                </Button>

                <Input
                    label="Legenda (opcional)"
                    placeholder="Descreva a foto"
                    maxLength={255}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <Button variant="ghost" size="md" onClick={onClose}>
                        Cancelar
                    </Button>
                    <FormButtom label="Enviar foto" type="submit" loading={saving} />
                </div>
            </form>
        </Modal>
    );
}
