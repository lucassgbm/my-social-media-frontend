'use client';

import { useEffect, useRef, useState } from "react";
import Image from "../remote-image";
import Modal from "../modal";
import Input from "../input";
import Select from "../select";
import Textarea from "../textarea";
import Button from "../button";
import FormButtom from "../form-buttom";
import PhotoIcon from "../icons/photo";
import LockClosedIcon from "../icons/lock-closed";
import UsersIcon from "../icons/users";
import { postFormData } from "@/api/services/request";
import { useToaster } from "../../providers/toaster-provider";
import type { Community } from "../../utils/community";

export type CommunityCategory = { id: number; name: string };

type CommunityModalProps = {
    isOpen: boolean;
    onClose: () => void;
    categories: CommunityCategory[];
    /** Comunidade sendo editada. Sem ela, o modal cria uma nova. */
    community?: Community | null;
    /** Recebe a comunidade criada ou editada, já com os `can_*` recalculados. */
    onSaved: (community: Community) => void;
};

type FormErrors = {
    name?: string;
    category_id?: string;
    photo?: string;
};

type Visibility = "public" | "private";

const VISIBILITY_HELP: Record<Visibility, string> = {
    public: "Qualquer pessoa pode entrar sozinha.",
    private: "Só entra quem receber um convite de quem já participa.",
};

/**
 * Formulário de comunidade, usado para criar (na listagem) e para editar (na
 * página da comunidade).
 *
 * Um componente só porque os dois formulários são o mesmo: o que muda é o
 * endpoint e a capa ser obrigatória apenas na criação — editar sem escolher
 * arquivo mantém a atual.
 */
export default function CommunityModal({
    isOpen,
    onClose,
    categories,
    community = null,
    onSaved,
}: CommunityModalProps) {
    const { showToast } = useToaster();

    const isEdit = community !== null;
    const title = isEdit ? "Editar comunidade" : "Nova comunidade";

    const [form, setForm] = useState({
        name: "",
        category_id: "",
        description: "",
        visibility: "public" as Visibility,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [saving, setSaving] = useState(false);

    const [photo, setPhoto] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    /**
     * Cada abertura recomeça do estado certo: os dados da comunidade na edição,
     * campos vazios na criação. Sem isso, editar uma e abrir outra em seguida
     * mostraria os dados da primeira.
     */
    useEffect(() => {
        if (!isOpen) return;

        setForm({
            name: community?.name ?? "",
            category_id: community?.category_id ? String(community.category_id) : "",
            description: community?.description ?? "",
            visibility: community?.is_private ? "private" : "public",
        });
        setErrors({});
        setPhoto(null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = "";
    }, [isOpen, community]);

    // revoga a URL do preview anterior a cada troca de arquivo e no unmount
    useEffect(() => {
        if (!preview) return;
        return () => URL.revokeObjectURL(preview);
    }, [preview]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setPhoto(file);
        setPreview(URL.createObjectURL(file));
        setErrors((current) => ({ ...current, photo: undefined }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const found: FormErrors = {};
        if (form.name.trim() === "") found.name = "Informe o nome da comunidade";
        if (form.category_id === "") found.category_id = "Escolha uma categoria";
        // a capa é obrigatória só na criação ('photo' => 'required|image');
        // na edição, sem arquivo novo a atual continua valendo
        if (!isEdit && !photo) found.photo = "Escolha uma imagem de capa";

        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSaving(true);

        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("category_id", form.category_id);
        formData.append("description", form.description);
        formData.append("is_private", form.visibility === "private" ? "1" : "0");
        if (photo) formData.append("photo", photo);

        const endpoint = isEdit
            ? `/social-media/community/${community.id}`
            : "/social-media/community";

        try {
            const response = await postFormData(endpoint, formData);

            // postFormData devolve { errors } no 422 em vez de lançar
            if (response?.errors) {
                const apiErrors: FormErrors = {};
                Object.entries(response.errors).forEach(([field, messages]) => {
                    apiErrors[field as keyof FormErrors] = Array.isArray(messages)
                        ? String(messages[0])
                        : String(messages);
                });

                setErrors(apiErrors);
                showToast({ title, message: "Revise os campos destacados.", status: "error" });
                return;
            }

            showToast({
                title,
                message: isEdit
                    ? "Comunidade atualizada com sucesso!"
                    : "Comunidade criada com sucesso!",
                status: "success",
            });

            onSaved(response?.data as Community);
            onClose();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({
                title,
                message:
                    error?.response?.data?.message ??
                    (isEdit
                        ? "Não foi possível salvar as alterações."
                        : "Não foi possível criar a comunidade."),
                status: "error",
            });
        } finally {
            setSaving(false);
        }
    }

    // na edição, sem arquivo novo a capa exibida é a que já está no ar
    const cover = preview ?? community?.photo ?? null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} width="sm:w-[720px]">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col sm:flex-row gap-6">

                <div className="w-full sm:w-[40%] flex flex-col items-center gap-3">
                    {cover ? (
                        <Image
                            src={cover}
                            alt="Pré-visualização da capa"
                            width={220}
                            height={220}
                            className="w-full aspect-square rounded-card object-cover"
                        />
                    ) : (
                        <div className="flex w-full aspect-square flex-col items-center justify-center gap-2
                            rounded-card border border-dashed border-line text-content-muted">
                            <PhotoIcon className="size-8" />
                            <span className="text-xs">Sem capa</span>
                        </div>
                    )}

                    <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                        {cover ? "Trocar imagem" : "Escolher imagem"}
                    </Button>

                    {errors.photo && (
                        <span role="alert" className="text-xs text-danger">
                            {errors.photo}
                        </span>
                    )}

                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileChange}
                    />
                </div>

                <div className="w-full sm:w-[60%] flex flex-col gap-4">
                    <Input
                        label="Nome"
                        type="text"
                        placeholder="Digite o nome da comunidade"
                        value={form.name}
                        error={errors.name}
                        onChange={(e) => {
                            setForm({ ...form, name: e.target.value });
                            setErrors({ ...errors, name: undefined });
                        }}
                    />

                    <Select
                        label="Categoria"
                        value={form.category_id}
                        error={errors.category_id}
                        onChange={(e) => {
                            setForm({ ...form, category_id: e.target.value });
                            setErrors({ ...errors, category_id: undefined });
                        }}
                        options={[
                            { value: "", label: "Selecione" },
                            ...categories.map((category) => ({
                                value: String(category.id),
                                label: category.name,
                            })),
                        ]}
                    />

                    {/* ------------------------------------------------ Privacidade
                        Duas opções lado a lado em vez de um <select>: a diferença
                        entre elas é uma regra, não um rótulo, e cada uma explica
                        a sua. Radios de verdade para o teclado navegar com as
                        setas, como em qualquer escolha exclusiva. */}
                    <fieldset className="flex flex-col gap-2">
                        <legend className="font-semibold text-xs mb-2">Quem pode entrar</legend>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {([
                                { id: "public", label: "Pública", icon: UsersIcon },
                                { id: "private", label: "Privada", icon: LockClosedIcon },
                            ] as const).map(({ id, label, icon: Icon }) => (
                                <label
                                    key={id}
                                    className={`flex cursor-pointer flex-col gap-1 rounded-card border p-3
                                        transition-colors
                                        has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2
                                        has-[:focus-visible]:outline-brand-ring
                                        ${form.visibility === id
                                            ? "border-brand bg-brand-subtle text-brand"
                                            : "border-line hover:border-line-strong"}`}
                                >
                                    <span className="flex flex-row items-center gap-2">
                                        <input
                                            type="radio"
                                            name="community-visibility"
                                            value={id}
                                            checked={form.visibility === id}
                                            onChange={() => setForm({ ...form, visibility: id })}
                                            className="sr-only"
                                        />
                                        <Icon className="size-4 shrink-0" />
                                        <span className="text-sm font-semibold">{label}</span>
                                    </span>

                                    <span
                                        className={`text-xs ${form.visibility === id ? "" : "text-content-muted"}`}
                                    >
                                        {VISIBILITY_HELP[id]}
                                    </span>
                                </label>
                            ))}
                        </div>

                        {isEdit && form.visibility === "private" && !community.is_private && (
                            <p className="text-xs text-content-muted">
                                Quem já participa continua na comunidade.
                            </p>
                        )}
                    </fieldset>

                    <Textarea
                        label="Descrição"
                        rows={4}
                        maxLength={280}
                        showCount
                        placeholder="Do que se trata a comunidade?"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />

                    <div className="flex flex-row justify-end gap-2">
                        <Button variant="ghost" size="md" onClick={onClose}>
                            Cancelar
                        </Button>
                        <FormButtom
                            label={isEdit ? "Salvar alterações" : "Criar"}
                            type="submit"
                            loading={saving}
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
}
