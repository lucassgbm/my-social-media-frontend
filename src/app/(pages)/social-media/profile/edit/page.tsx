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

type ProfileErrors = Partial<Record<keyof ProfileForm | "photo" | "cover", string>>;

/** Imagens do formulário — as duas seguem o mesmo fluxo de escolha e recorte. */
type ImageTarget = "photo" | "cover";

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

/** Capa exibida no perfil enquanto o usuário não envia uma. */
const DEFAULT_COVER = "/imgs/placeholder.png";

/** Proporção do recorte da capa — a mesma do cabeçalho do perfil. */
const COVER_ASPECT = 3;

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

/**
 * Estado de uma imagem do formulário: escolher arquivo → recortar →
 * pré-visualizar → enviar.
 *
 * `cropped` é o recorte que vai para a API; `original` é o arquivo como veio do
 * disco, guardado para permitir reenquadrar sem perder qualidade.
 */
function useImagePicker() {
    const [cropped, setCropped] = useState<File | null>(null);
    const [original, setOriginal] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [removed, setRemoved] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // revoga a URL anterior a cada troca de arquivo e no unmount
    useEffect(() => {
        if (!preview) return;
        return () => URL.revokeObjectURL(preview);
    }, [preview]);

    function clearInput() {
        if (inputRef.current) inputRef.current.value = "";
    }

    return {
        cropped,
        original,
        preview,
        /** o usuário pediu para voltar à imagem padrão (só a capa oferece isso) */
        removed,
        inputRef,

        /** guarda a escolha; a imagem só entra no formulário depois de enquadrada */
        select(file: File) {
            setOriginal(file);
            setRemoved(false);
        },

        applyCrop(file: File) {
            setCropped(file);
            setPreview(URL.createObjectURL(file));
        },

        /**
         * Cancelar o primeiro recorte descarta a escolha; se já existe um
         * recorte aplicado, o anterior continua valendo.
         */
        cancelCrop() {
            if (!cropped) setOriginal(null);
        },

        remove() {
            setCropped(null);
            setOriginal(null);
            setPreview(null);
            setRemoved(true);
            clearInput();
        },

        /** depois de salvar, a imagem passa a vir de myInfo (URL do R2) */
        reset() {
            setCropped(null);
            setOriginal(null);
            setPreview(null);
            setRemoved(false);
            clearInput();
        },
    };
}

export default function EditProfilePage() {
    const { myInfo, setMyInfo } = useContext(AppContext);
    const { showToast } = useToaster();

    const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
    const [errors, setErrors] = useState<ProfileErrors>({});
    const [saving, setSaving] = useState(false);

    const photoPicker = useImagePicker();
    const coverPicker = useImagePicker();

    // qual editor de recorte está aberto — os dois compartilham o componente
    const [cropping, setCropping] = useState<ImageTarget | null>(null);

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

    const loading = !myInfo;
    const age = ageFrom(form.birthdate);

    const avatar = photoPicker.preview ?? (myInfo?.photo || "/imgs/placeholder.png");

    // enquanto a remoção não é salva, myInfo ainda traz a capa antiga: o
    // `removed` é o que faz a tela mostrar a capa padrão desde já
    const cover =
        coverPicker.preview ??
        (coverPicker.removed ? DEFAULT_COVER : myInfo?.cover || DEFAULT_COVER);

    const hasCover = coverPicker.preview !== null || (!coverPicker.removed && !!myInfo?.cover);

    function setField<K extends keyof ProfileForm>(field: K, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    }

    function pickerFor(target: ImageTarget) {
        return target === "photo" ? photoPicker : coverPicker;
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, target: ImageTarget) {
        const file = e.target.files?.[0];
        if (!file) return;

        // o recorte é obrigatório: a imagem só entra no formulário depois de
        // enquadrada, então o que é enviado é sempre o que foi visto na tela
        pickerFor(target).select(file);
        setCropping(target);
        setErrors((current) => ({ ...current, [target]: undefined }));

        // permite reescolher o mesmo arquivo depois de cancelar o recorte
        e.target.value = "";
    }

    function handleCropConfirm(target: ImageTarget, croppedFile: File) {
        pickerFor(target).applyCrop(croppedFile);
        setCropping(null);
    }

    function handleCropCancel(target: ImageTarget) {
        pickerFor(target).cancelCrop();
        setCropping(null);
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
        if (photoPicker.cropped) formData.append("photo", photoPicker.cropped);

        if (coverPicker.cropped) formData.append("cover", coverPicker.cropped);
        // sem arquivo novo, só a flag distingue "não mexi na capa" de
        // "quero voltar para a capa padrão"
        else if (coverPicker.removed) formData.append("remove_cover", "1");

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

            // as imagens agora vêm de myInfo (URL do R2): o preview local sai de cena
            photoPicker.reset();
            coverPicker.reset();

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
                            <Skeleton className="w-full aspect-[3/1]" rounded="card" />
                            <Skeleton className="size-[120px]" rounded="full" width="w-[120px]" />
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Skeleton key={index} className="h-11" rounded="field" />
                            ))}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8 p-4">

                            {/* ---------------------------------------------------- Capa */}
                            <section className="flex flex-col gap-3">
                                <h2 className="text-lg font-semibold">Foto de capa</h2>

                                {/* mesma proporção do cabeçalho do perfil: o que
                                    aparece aqui é o que vai aparecer lá */}
                                <div className="relative w-full aspect-[3/1] overflow-hidden rounded-card border border-line">
                                    <Image
                                        src={cover}
                                        alt="Sua foto de capa"
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 720px"
                                        className="object-cover"
                                    />
                                </div>

                                <div className="flex flex-col items-start gap-2">
                                    <div className="flex flex-row flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => coverPicker.inputRef.current?.click()}
                                        >
                                            <PhotoIcon className="size-4" />
                                            {hasCover ? "Trocar capa" : "Escolher capa"}
                                        </Button>

                                        {coverPicker.original && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setCropping("cover")}
                                            >
                                                <PencilSquareIcon className="size-4" />
                                                Ajustar recorte
                                            </Button>
                                        )}

                                        {hasCover && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => coverPicker.remove()}
                                            >
                                                Remover capa
                                            </Button>
                                        )}
                                    </div>

                                    <p className="text-xs text-content-muted">
                                        Imagens largas funcionam melhor. Sem capa própria, o perfil
                                        usa a imagem padrão.
                                    </p>

                                    {errors.cover && (
                                        <span role="alert" className="text-xs text-danger">
                                            {errors.cover}
                                        </span>
                                    )}
                                </div>

                                <input
                                    ref={coverPicker.inputRef}
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => handleFileChange(e, "cover")}
                                />
                            </section>

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
                                                onClick={() => photoPicker.inputRef.current?.click()}
                                            >
                                                <PhotoIcon className="size-4" />
                                                {photoPicker.cropped ? "Trocar imagem" : "Escolher imagem"}
                                            </Button>

                                            {/* reabre o editor com o arquivo original, então
                                                reenquadrar não acumula perda de qualidade */}
                                            {photoPicker.original && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => setCropping("photo")}
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
                                        ref={photoPicker.inputRef}
                                        type="file"
                                        accept="image/*"
                                        className="sr-only"
                                        onChange={(e) => handleFileChange(e, "photo")}
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

                        {/* capa e avatar sobrepostos como no cabeçalho do perfil */}
                        <div className="relative w-full aspect-[3/1] overflow-hidden rounded-card">
                            <Image
                                src={cover}
                                alt=""
                                fill
                                sizes="(max-width: 1024px) 100vw, 320px"
                                className="object-cover"
                            />
                        </div>

                        <div className="flex flex-col items-center text-center gap-2">
                            {/* -mt sobe o avatar sobre a capa; relative z-10 é
                                obrigatório porque a capa é uma <Image fill> e,
                                sendo posicionada, seria pintada por cima */}
                            <RingImage className="relative z-10 -mt-11 w-[88px]">
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
                isOpen={cropping === "photo"}
                file={photoPicker.original}
                onCancel={() => handleCropCancel("photo")}
                onConfirm={(file) => handleCropConfirm("photo", file)}
                title="Recortar foto de perfil"
                // avatar é sempre circular na aplicação: recorte quadrado com
                // máscara redonda mostra exatamente o que vai aparecer
                aspect={1}
                cropShape="round"
                outputSize={512}
            />

            <ImageCropper
                isOpen={cropping === "cover"}
                file={coverPicker.original}
                onCancel={() => handleCropCancel("cover")}
                onConfirm={(file) => handleCropConfirm("cover", file)}
                title="Recortar foto de capa"
                // a capa é uma faixa larga: recorte retangular na mesma
                // proporção do cabeçalho do perfil
                aspect={COVER_ASPECT}
                cropShape="rect"
                // faixa larga precisa de mais pixels que o avatar para não
                // ficar borrada em telas grandes
                outputSize={1600}
            />
        </>
    );
}
