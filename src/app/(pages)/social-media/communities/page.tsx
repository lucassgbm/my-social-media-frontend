'use client';

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Image from "../../../../../components/remote-image";
import Container from "../../../../../components/container";
import Button from "../../../../../components/button";
import ColorButton from "../../../../../components/color-button";
import Modal from "../../../../../components/modal";
import Input from "../../../../../components/input";
import Textarea from "../../../../../components/textarea";
import FormButtom from "../../../../../components/form-buttom";
import Sidebar from "../../../../../components/sidebar";
import Skeleton from "../../../../../components/skeleton";
import ListCommunities, { type Community } from "../../../../../components/communities/list-communities";
import SearchIcon from "../../../../../components/icons/search";
import CloseIcon from "../../../../../components/icons/close";
import PhotoIcon from "../../../../../components/icons/photo";
import CommunityIcon from "../../../../../components/icons/community";
import PlusIcon from "../../../../../components/icons/plus";
import { AppContext } from "../layout";
import { get, postFormData } from "@/api/services/request";
import CommunitySuggestions from "../../../../../components/communities/community-suggestions";
import { useToaster } from "../../../../../providers/toaster-provider";

type Category = { id: number; name: string };
type Tab = "all" | "mine";

const GRID = "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4";

type NewCommunityErrors = {
    name?: string;
    category_id?: string;
    photo?: string;
};

export default function Home() {
    const { showToast } = useToaster();

    const { myInfo } = useContext(AppContext);

    const [communities, setCommunities] = useState<Community[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [tab, setTab] = useState<Tab>("all");
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

    const [modalNewCommunity, setModalNewCommunity] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newCommunity, setNewCommunity] = useState({
        name: "",
        category_id: "",
        description: "",
    });
    const [newErrors, setNewErrors] = useState<NewCommunityErrors>({});
    const [photo, setPhoto] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadAll();
    }, []);

    async function loadAll() {
        setLoading(true);

        // get() engole o erro e devolve undefined
        const [communitiesResponse, categoriesResponse] = await Promise.all([
            get("/social-media/community"),
            get("/category"),
        ]);

        if (!communitiesResponse) {
            showToast({
                title: "Comunidades",
                message: "Não foi possível carregar as comunidades.",
                status: "error",
            });
        }

        setCommunities(communitiesResponse?.data ?? []);
        setCategories(categoriesResponse?.data ?? []);
        setLoading(false);
    }

    const mine = useMemo(
        () => communities.filter((community) => community.owner_id === myInfo?.id),
        [communities, myInfo?.id]
    );

    const filtered = useMemo(() => {
        const base = tab === "mine" ? mine : communities;
        const term = search.trim().toLowerCase();

        return base.filter((community) => {
            const matchesTerm =
                term === "" || community.name?.toLowerCase().includes(term);
            const matchesCategory =
                categoryFilter === null || community.category_id === categoryFilter;

            return matchesTerm && matchesCategory;
        });
    }, [communities, mine, tab, search, categoryFilter]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (preview) URL.revokeObjectURL(preview);

        setPhoto(file);
        setPreview(URL.createObjectURL(file));
        setNewErrors({ ...newErrors, photo: undefined });
    }

    function closeModal() {
        setModalNewCommunity(false);
        setNewErrors({});
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();

        const errors: NewCommunityErrors = {};
        if (newCommunity.name.trim() === "") errors.name = "Informe o nome da comunidade";
        if (newCommunity.category_id === "") errors.category_id = "Escolha uma categoria";
        // a API exige a imagem: 'photo' => 'required|image'
        if (!photo) errors.photo = "Escolha uma imagem de capa";

        setNewErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setSaving(true);

        const formData = new FormData();
        formData.append("name", newCommunity.name);
        formData.append("category_id", newCommunity.category_id);
        formData.append("description", newCommunity.description);
        if (photo) formData.append("photo", photo);

        try {
            const response = await postFormData("/social-media/community", formData);

            if (response?.errors) {
                const apiErrors: NewCommunityErrors = {};
                Object.entries(response.errors).forEach(([field, messages]) => {
                    apiErrors[field as keyof NewCommunityErrors] = Array.isArray(messages)
                        ? String(messages[0])
                        : String(messages);
                });
                setNewErrors(apiErrors);
                showToast({
                    title: "Nova comunidade",
                    message: "Revise os campos destacados.",
                    status: "error",
                });
                return;
            }

            showToast({
                title: "Nova comunidade",
                message: "Comunidade criada com sucesso!",
                status: "success",
            });

            setNewCommunity({ name: "", category_id: "", description: "" });
            setPhoto(null);
            setPreview(null);
            if (fileRef.current) fileRef.current.value = "";
            closeModal();
            loadAll();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({
                title: "Nova comunidade",
                message:
                    error?.response?.data?.message ??
                    "Não foi possível criar a comunidade.",
                status: "error",
            });
        } finally {
            setSaving(false);
        }
    }

    const tabClass = (active: boolean) =>
        `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors cursor-pointer
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
        ${active ? "bg-brand-subtle text-brand" : "text-content-muted hover:bg-surface-2"}`;

    const chipClass = (active: boolean) =>
        `flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
        ${active
            ? "border-brand bg-brand-subtle text-brand"
            : "border-line text-content-muted hover:bg-surface-2"}`;

    return (
        <>
            <Sidebar />

            <div className="flex flex-1 min-w-0 flex-col lg:flex-row gap-4">
                <Container className="w-full lg:w-[72%] rounded-card min-w-0" padding="p-0">

                    <div className="flex flex-col gap-4 border-b border-line p-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h1 className="text-2xl font-semibold">Comunidades</h1>
                            <span className="text-sm text-content-muted">
                                {loading
                                    ? "Carregando..."
                                    : `${communities.length} ${communities.length === 1 ? "comunidade" : "comunidades"}`}
                            </span>
                        </div>

                        {/* Busca real. Antes o botão de lupa abria o modal de
                            criar comunidade e nada era filtrado. */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex w-full items-center gap-2 rounded-full border border-line
                                bg-surface-2 px-4 py-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-ring">
                                <SearchIcon className="size-5 shrink-0 text-content-muted" />
                                <input
                                    type="search"
                                    aria-label="Buscar comunidades pelo nome"
                                    placeholder="Buscar pelo nome..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-transparent text-sm text-content placeholder:text-content-subtle outline-none"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        aria-label="Limpar busca"
                                        className="rounded-full p-1 text-content-muted hover:bg-surface-3 hover:text-content
                                            cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                    >
                                        <CloseIcon className="size-3" />
                                    </button>
                                )}
                            </div>

                            <ColorButton
                                onClick={() => setModalNewCommunity(true)}
                                className="shrink-0 px-4 text-sm font-semibold"
                            >
                                <PlusIcon className="size-4 shrink-0" />
                                Criar comunidade
                            </ColorButton>
                        </div>

                        <div role="tablist" aria-label="Listas de comunidades" className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={tab === "all"}
                                onClick={() => setTab("all")}
                                className={tabClass(tab === "all")}
                            >
                                <CommunityIcon className="size-4" />
                                Todas
                                <span className="text-xs opacity-80">{communities.length}</span>
                            </button>

                            <button
                                type="button"
                                role="tab"
                                aria-selected={tab === "mine"}
                                onClick={() => setTab("mine")}
                                className={tabClass(tab === "mine")}
                            >
                                <PlusIcon className="size-4" />
                                Criadas por mim
                                <span className="text-xs opacity-80">{mine.length}</span>
                            </button>
                        </div>

                        {/* Categorias vindas de GET /category, no lugar do chip
                            "Automobilismo" fixo que não filtrava nada */}
                        {categories.length > 0 && (
                            <div className="flex flex-row flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCategoryFilter(null)}
                                    aria-pressed={categoryFilter === null}
                                    className={chipClass(categoryFilter === null)}
                                >
                                    Todas as categorias
                                </button>

                                {categories.map((category) => {
                                    const active = categoryFilter === category.id;

                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => setCategoryFilter(active ? null : category.id)}
                                            aria-pressed={active}
                                            className={chipClass(active)}
                                        >
                                            {category.name}
                                            {active && <CloseIcon className="size-3" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="p-4">
                        {loading && (
                            <div className={GRID}>
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <Skeleton
                                        key={index}
                                        width="w-full"
                                        rounded="card"
                                        className="aspect-[16/9]"
                                    />
                                ))}
                            </div>
                        )}

                        {!loading && filtered.length > 0 && (
                            <div className={GRID}>
                                <ListCommunities communities={filtered} />
                            </div>
                        )}

                        {!loading && filtered.length === 0 && (
                            <div className="flex flex-col items-center gap-3 py-12 text-center">
                                <CommunityIcon className="size-10 text-content-subtle" />

                                <h2 className="text-base font-semibold">
                                    {search || categoryFilter !== null
                                        ? "Nenhum resultado"
                                        : tab === "mine"
                                            ? "Você ainda não criou comunidades"
                                            : "Nenhuma comunidade por aqui"}
                                </h2>

                                <p className="max-w-sm text-sm text-content-muted">
                                    {search || categoryFilter !== null
                                        ? "Tente outro termo ou remova os filtros."
                                        : "Crie a primeira e convide as pessoas para participar."}
                                </p>

                                {!search && categoryFilter === null && (
                                    <ColorButton
                                        onClick={() => setModalNewCommunity(true)}
                                        className="px-4 text-sm font-semibold"
                                    >
                                        <PlusIcon className="size-4" />
                                        Criar comunidade
                                    </ColorButton>
                                )}
                            </div>
                        )}
                    </div>
                </Container>

                <aside aria-label="Sugestões" className="w-full flex flex-col lg:w-[28%] gap-4">
                    <Container className="rounded-card" padding="p-4">
                        <h2 className="text-lg font-semibold mb-4">Comunidades sugeridas</h2>

                        <CommunitySuggestions
                            limit={4}
                            gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3"
                        />
                    </Container>
                </aside>
            </div>

            <Modal
                isOpen={modalNewCommunity}
                onClose={closeModal}
                title="Nova comunidade"
                width="sm:w-[720px]"
            >
                <form onSubmit={handleCreate} noValidate className="flex flex-col sm:flex-row gap-6">

                    <div className="w-full sm:w-[40%] flex flex-col items-center gap-3">
                        {preview ? (
                            <Image
                                src={preview}
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
                            {photo ? "Trocar imagem" : "Escolher imagem"}
                        </Button>

                        {newErrors.photo && (
                            <span role="alert" className="text-xs text-danger">
                                {newErrors.photo}
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
                            value={newCommunity.name}
                            error={newErrors.name}
                            onChange={(e) => {
                                setNewCommunity({ ...newCommunity, name: e.target.value });
                                setNewErrors({ ...newErrors, name: undefined });
                            }}
                        />

                        <div className="flex flex-col w-full">
                            <label htmlFor="community-category" className="font-semibold text-xs mb-2">
                                Categoria
                            </label>
                            <select
                                id="community-category"
                                value={newCommunity.category_id}
                                aria-invalid={newErrors.category_id ? true : undefined}
                                onChange={(e) => {
                                    setNewCommunity({ ...newCommunity, category_id: e.target.value });
                                    setNewErrors({ ...newErrors, category_id: undefined });
                                }}
                                className={`w-full text-sm p-3 rounded-field bg-surface text-content
                                    border ${newErrors.category_id ? "border-danger" : "border-line"}
                                    focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-ring`}
                            >
                                <option value="">Selecione</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {newErrors.category_id && (
                                <span role="alert" className="text-xs text-danger mt-1">
                                    {newErrors.category_id}
                                </span>
                            )}
                        </div>

                        <Textarea
                            label="Descrição"
                            rows={4}
                            maxLength={280}
                            showCount
                            placeholder="Do que se trata a comunidade?"
                            value={newCommunity.description}
                            onChange={(e) =>
                                setNewCommunity({ ...newCommunity, description: e.target.value })
                            }
                        />

                        <div className="flex flex-row justify-end gap-2">
                            <Button variant="ghost" size="md" onClick={closeModal}>
                                Cancelar
                            </Button>
                            <FormButtom label="Criar" type="submit" loading={saving} />
                        </div>
                    </div>
                </form>
            </Modal>

        </>
    );
}
