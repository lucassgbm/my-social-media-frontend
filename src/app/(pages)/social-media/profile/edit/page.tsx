'use client';

import { useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "../../../../../../components/remote-image";
import Container from "../../../../../../components/container";
import Sidebar from "../../../../../../components/sidebar";
import SidebarFooter from "../../../../../../components/sidebar-footer";
import RingImage from "../../../../../../components/ring-image";
import Input from "../../../../../../components/input";
import Textarea from "../../../../../../components/textarea";
import Button from "../../../../../../components/button";
import FormButtom from "../../../../../../components/form-buttom";
import Skeleton from "../../../../../../components/skeleton";
import ImageCropper from "../../../../../../components/image-cropper";
import PhotoIcon from "../../../../../../components/icons/photo";
import PinIcon from "../../../../../../components/icons/pin";
import PencilSquareIcon from "../../../../../../components/icons/pencil-square";
import { AppContext, type MyInfo } from "../../layout";
import { useToaster } from "../../../../../../providers/toaster-provider";
import { postFormData } from "@/api/services/request";

/**
 * Campos gravados por POST /social-media/user (UpdateUserRequest).
 * São exatamente as colunas editáveis de `users` — `age` fica de fora porque o
 * backend a deriva de `birthdate`, e a senha tem fluxo próprio.
 */
type ProfileForm = {
    name: string;
    email: string;
    birthdate: string;
    phone: string;
    city: string;
    uf: string;
    autodescription: string;
};

type ProfileErrors = Partial<Record<keyof ProfileForm | "photo", string>>;

const EMPTY_FORM: ProfileForm = {
    name: "",
    email: "",
    birthdate: "",
    phone: "",
    city: "",
    uf: "",
    autodescription: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mesma lista aceita pelo `Rule::in` do UpdateUserRequest (users.uf é char(2)). */
const UFS = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
    "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

/** Limite do `max:280` da API — o contador do textarea usa o mesmo número. */
const BIO_MAX = 280;

function ageFrom(birthdate: string): number | null {
    if (!birthdate) return null;

    const date = new Date(`${birthdate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();

    // ainda não fez aniversário este ano
    const beforeBirthday =
        today.getMonth() < date.getMonth() ||
        (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());
    if (beforeBirthday) age -= 1;

    return age >= 0 ? age : null;
}

export default function EditProfilePage() {
    const { myInfo, setMyInfo } = useContext(AppContext);
    const { showToast } = useToaster();

    const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
    const [errors, setErrors] = useState<ProfileErrors>({});
    const [saving, setSaving] = useState(false);

    // `photo` é o recorte que vai para a API; `originalPhoto` é o arquivo como
    // veio do disco, guardado para permitir reenquadrar sem perder qualidade
    const [photo, setPhoto] = useState<File | null>(null);
    const [originalPhoto, setOriginalPhoto] = useState<File | null>(null);
    const [cropping, setCropping] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // O layout busca /social-media/user no cliente, então myInfo chega depois da
    // primeira renderização: o formulário só é preenchido quando a resposta existe.
    useEffect(() => {
        if (!myInfo) return;

        setForm({
            name: myInfo.name ?? "",
            email: myInfo.email ?? "",
            // a coluna é DATE, mas pode vir com hora dependendo do driver —
            // <input type="date"> só aceita YYYY-MM-DD
            birthdate: (myInfo.birthdate ?? "").slice(0, 10),
            phone: myInfo.phone ?? "",
            city: myInfo.city ?? "",
            uf: myInfo.uf ?? "",
            autodescription: myInfo.autodescription ?? "",
        });
    }, [myInfo]);

    // revoga a URL anterior a cada troca de arquivo e no unmount
    useEffect(() => {
        if (!preview) return;
        return () => URL.revokeObjectURL(preview);
    }, [preview]);

    const loading = !myInfo;
    const age = ageFrom(form.birthdate);
    const avatar = preview ?? (myInfo?.photo || "/imgs/placeholder.png");

    function setField<K extends keyof ProfileForm>(field: K, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // o recorte é obrigatório: a foto só entra no formulário depois de
        // enquadrada, então o que é enviado é sempre o que foi visto na tela
        setOriginalPhoto(file);
        setCropping(true);
        setErrors((current) => ({ ...current, photo: undefined }));

        // permite reescolher o mesmo arquivo depois de cancelar o recorte
        e.target.value = "";
    }

    function handleCropConfirm(croppedFile: File) {
        setPhoto(croppedFile);
        setPreview(URL.createObjectURL(croppedFile));
        setCropping(false);
    }

    function handleCropCancel() {
        setCropping(false);

        // cancelar o primeiro recorte descarta a escolha; se já existe um
        // recorte aplicado, o anterior continua valendo
        if (!photo) setOriginalPhoto(null);
    }

    /** Espelha as regras do UpdateUserRequest para evitar um 422 previsível. */
    function validate(): ProfileErrors {
        const found: ProfileErrors = {};

        if (form.name.trim() === "") found.name = "Informe o seu nome";

        if (form.email.trim() === "") found.email = "Informe o seu e-mail";
        else if (!EMAIL_PATTERN.test(form.email)) found.email = "E-mail inválido";

        if (form.birthdate !== "") {
            const date = new Date(`${form.birthdate}T00:00:00`);
            if (Number.isNaN(date.getTime())) found.birthdate = "Data inválida";
            else if (date >= new Date()) found.birthdate = "A data não pode ser no futuro";
        }

        if (form.autodescription.length > BIO_MAX)
            found.autodescription = `Máximo de ${BIO_MAX} caracteres`;

        return found;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const found = validate();
        setErrors(found);
        if (Object.keys(found).length > 0) {
            showToast({
                title: "Editar perfil",
                message: "Revise os campos destacados.",
                status: "error",
            });
            return;
        }

        setSaving(true);

        const formData = new FormData();
        (Object.keys(form) as (keyof ProfileForm)[]).forEach((field) => {
            formData.append(field, form[field]);
        });
        if (photo) formData.append("photo", photo);

        try {
            const response = await postFormData("/social-media/user", formData);

            // postFormData devolve { errors } no 422 em vez de lançar
            if (response?.errors) {
                const apiErrors: ProfileErrors = {};
                Object.entries(response.errors).forEach(([field, messages]) => {
                    apiErrors[field as keyof ProfileErrors] = Array.isArray(messages)
                        ? String(messages[0])
                        : String(messages);
                });

                setErrors(apiErrors);
                showToast({
                    title: "Editar perfil",
                    message: "Revise os campos destacados.",
                    status: "error",
                });
                return;
            }

            // atualiza o contexto para o header e o perfil refletirem a mudança
            // sem depender de um reload
            if (response?.data) setMyInfo(response.data as MyInfo);

            // a foto agora vem de myInfo (URL do R2): o preview local sai de cena
            setPhoto(null);
            setOriginalPhoto(null);
            setPreview(null);
            if (fileRef.current) fileRef.current.value = "";

            showToast({
                title: "Editar perfil",
                message: "Perfil atualizado com sucesso!",
                status: "success",
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({
                title: "Editar perfil",
                message:
                    error?.response?.data?.message ??
                    "Não foi possível salvar o perfil.",
                status: "error",
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <Sidebar />

            <div className="flex flex-1 min-w-0 flex-col lg:flex-row gap-4">
                <Container className="w-full lg:w-[72%] rounded-card min-w-0" padding="p-0">

                    <div className="flex flex-col gap-2 border-b border-line p-4">
                        

                        <h1 className="text-2xl font-semibold">Editar perfil</h1>
                        <p className="text-sm text-content-muted">
                            Estes dados aparecem no seu perfil para as outras pessoas.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col gap-4 p-4">
                            <Skeleton className="size-[120px]" rounded="full" width="w-[120px]" />
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Skeleton key={index} className="h-11" rounded="field" />
                            ))}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8 p-4">

                            {/* ---------------------------------------------------- Foto */}
                            <section className="flex flex-col gap-3">
                                <h2 className="text-lg font-semibold">Foto de perfil</h2>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <RingImage className="w-[120px] shrink-0">
                                        <Image
                                            src={avatar}
                                            alt="Sua foto de perfil"
                                            width={120}
                                            height={120}
                                            sizes="120px"
                                            className="w-full aspect-square object-cover rounded-full"
                                        />
                                    </RingImage>

                                    <div className="flex flex-col items-start gap-2">
                                        <div className="flex flex-row flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fileRef.current?.click()}
                                            >
                                                <PhotoIcon className="size-4" />
                                                {photo ? "Trocar imagem" : "Escolher imagem"}
                                            </Button>

                                            {/* reabre o editor com o arquivo original, então
                                                reenquadrar não acumula perda de qualidade */}
                                            {originalPhoto && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => setCropping(true)}
                                                >
                                                    <PencilSquareIcon className="size-4" />
                                                    Ajustar recorte
                                                </Button>
                                            )}
                                        </div>

                                        <p className="text-xs text-content-muted">
                                            JPG, PNG ou GIF. Você recorta a imagem antes de salvar.
                                        </p>

                                        {errors.photo && (
                                            <span role="alert" className="text-xs text-danger">
                                                {errors.photo}
                                            </span>
                                        )}
                                    </div>

                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        className="sr-only"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </section>

                            {/* ------------------------------------------------ Dados */}
                            <section className="flex flex-col gap-4">
                                <h2 className="text-lg font-semibold">Dados pessoais</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Nome completo"
                                        type="text"
                                        placeholder="Digite o seu nome"
                                        value={form.name}
                                        error={errors.name}
                                        onChange={(e) => setField("name", e.target.value)}
                                    />

                                    <Input
                                        label="E-mail"
                                        type="email"
                                        placeholder="Digite o seu e-mail"
                                        value={form.email}
                                        error={errors.email}
                                        onChange={(e) => setField("email", e.target.value)}
                                    />

                                    <div className="flex flex-col">
                                        <Input
                                            label="Data de nascimento"
                                            type="date"
                                            value={form.birthdate}
                                            error={errors.birthdate}
                                            onChange={(e) => setField("birthdate", e.target.value)}
                                        />
                                        {/* users.age é calculada pela API a partir da data */}
                                        {age !== null && !errors.birthdate && (
                                            <span className="text-xs text-content-muted mt-1">
                                                {age} anos
                                            </span>
                                        )}
                                    </div>

                                    <Input
                                        label="Telefone"
                                        type="tel"
                                        placeholder="(00) 00000-0000"
                                        value={form.phone}
                                        error={errors.phone}
                                        onChange={(e) => setField("phone", e.target.value)}
                                    />

                                    <Input
                                        label="Cidade"
                                        type="text"
                                        placeholder="Onde você mora"
                                        value={form.city}
                                        error={errors.city}
                                        onChange={(e) => setField("city", e.target.value)}
                                    />

                                    <div className="flex flex-col w-full">
                                        <label htmlFor="profile-uf" className="font-semibold text-xs mb-2">
                                            UF
                                        </label>
                                        <select
                                            id="profile-uf"
                                            value={form.uf}
                                            aria-invalid={errors.uf ? true : undefined}
                                            onChange={(e) => setField("uf", e.target.value)}
                                            className={`w-full text-sm p-3 rounded-field bg-surface text-content
                                                border ${errors.uf ? "border-danger" : "border-line"}
                                                focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-ring`}
                                        >
                                            <option value="">Selecione</option>
                                            {UFS.map((uf) => (
                                                <option key={uf} value={uf}>
                                                    {uf}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.uf && (
                                            <span role="alert" className="text-xs text-danger mt-1">
                                                {errors.uf}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* ------------------------------------------------ Sobre */}
                            <section className="flex flex-col gap-4">
                                <h2 className="text-lg font-semibold">Sobre você</h2>

                                <Textarea
                                    label="Autodescrição"
                                    rows={5}
                                    maxLength={BIO_MAX}
                                    showCount
                                    placeholder="Como você se autodescreve?"
                                    value={form.autodescription}
                                    error={errors.autodescription}
                                    onChange={(e) => setField("autodescription", e.target.value)}
                                />
                            </section>

                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-line pt-4">
                                {/* Link estilizado como botão em vez de <Button> dentro
                                    de <Link>: <button> dentro de <a> é aninhamento inválido */}
                                <Link
                                    href={`/social-media/profile/${encodeURIComponent(myInfo?.name ?? "")}`}
                                    className="inline-flex items-center justify-center gap-2 rounded-full
                                        px-4 py-2 text-sm font-semibold text-content transition-colors
                                        hover:bg-surface-3
                                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                >
                                    Cancelar
                                </Link>

                                <FormButtom label="Salvar alterações" type="submit" loading={saving} />
                            </div>
                        </form>
                    )}
                </Container>

                <aside aria-label="Pré-visualização" className="w-full lg:w-[28%] flex flex-col gap-4">
                    <Container className="rounded-card" padding="p-4">
                        <h2 className="text-lg font-semibold mb-4">Pré visualização</h2>

                        <div className="flex flex-col items-center text-center gap-2">
                            <RingImage className="w-[88px]">
                                <Image
                                    src={avatar}
                                    alt=""
                                    width={88}
                                    height={88}
                                    sizes="88px"
                                    className="w-full aspect-square object-cover rounded-full"
                                />
                            </RingImage>

                            <h3 className="text-base font-semibold break-words">
                                {form.name || "Seu nome"}
                            </h3>

                            {(form.city || form.uf) && (
                                <div className="flex flex-row items-center gap-1 text-content-muted">
                                    <PinIcon className="size-3 shrink-0" />
                                    <span className="text-sm">
                                        {[form.city, form.uf].filter(Boolean).join(" - ")}
                                    </span>
                                </div>
                            )}

                            <p className="text-sm text-content-muted break-words">
                                {form.autodescription || "Sua autodescrição aparece aqui."}
                            </p>
                        </div>
                    </Container>

                    <SidebarFooter />
                </aside>
            </div>

            <ImageCropper
                isOpen={cropping}
                file={originalPhoto}
                onCancel={handleCropCancel}
                onConfirm={handleCropConfirm}
                title="Recortar foto de perfil"
                // avatar é sempre circular na aplicação: recorte quadrado com
                // máscara redonda mostra exatamente o que vai aparecer
                aspect={1}
                cropShape="round"
                outputSize={512}
            />
        </>
    );
}
