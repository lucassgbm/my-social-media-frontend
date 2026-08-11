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
import PageHeader from "../../../../../components/page-header";
import StatChip from "../../../../../components/stat-chip";
import ListCommunities from "../../../../../components/communities/list-communities";
import InviteList from "../../../../../components/communities/invite-list";
import FilterBar, { type ActiveFilter } from "../../../../../components/filters/filter-bar";
import FilterModal from "../../../../../components/filters/filter-modal";
import SearchField from "../../../../../components/filters/search-field";
import Select from "../../../../../components/select";
import PhotoIcon from "../../../../../components/icons/photo";
import CommunityIcon from "../../../../../components/icons/community";
import PlusIcon from "../../../../../components/icons/plus";
import UsersIcon from "../../../../../components/icons/users";
import TrophyIcon from "../../../../../components/icons/trophy";
import { AppContext } from "../layout";
import { get, postFormData } from "@/api/services/request";
import CommunitySuggestions from "../../../../../components/communities/community-suggestions";
import InboxIcon from "../../../../../components/icons/inbox";
import { useToaster } from "../../../../../providers/toaster-provider";
import type { Community, CommunityInvite } from "../../../../../utils/community";

type Category = { id: number; name: string };

type Filters = {
    search: string;
    /** Id da categoria, "" para todas. */
    categoryId: string;
    /** `mine` = criadas por mim; `joined` = das quais participo. */
    membership: "all" | "mine" | "joined";
    sort: "recent" | "name" | "members";
};

const EMPTY_FILTERS: Filters = {
    search: "",
    categoryId: "",
    membership: "all",
    sort: "recent",
};

const MEMBERSHIP_LABELS: Record<Filters["membership"], string> = {
    all: "Todas",
    mine: "Criadas por mim",
    joined: "Que eu participo",
};

const SORT_LABELS: Record<Filters["sort"], string> = {
    recent: "Mais recentes",
    name: "Nome (A-Z)",
    members: "Mais membros",
};

const GRID = "grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4";

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
    const [invites, setInvites] = useState<CommunityInvite[]>([]);
    const [loading, setLoading] = useState(true);

    // os convites recebidos são uma lista à parte, não um recorte das
    // comunidades: por isso um modo de exibição, e não mais um valor de filtro
    const [showInvites, setShowInvites] = useState(false);

    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
    // rascunho do modal: a lista só muda quando se aplica
    const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
    const [filterModal, setFilterModal] = useState(false);

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
        const [communitiesResponse, categoriesResponse, invitesResponse] = await Promise.all([
            get("/social-media/community"),
            get("/category"),
            get("/social-media/community-invites"),
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
        setInvites(invitesResponse?.data ?? []);
        setLoading(false);
    }

    /** Aceitar entra na comunidade, então a listagem inteira é refeita. */
    function handleInviteResponded(inviteId: number, accepted: boolean) {
        const remaining = invites.filter((invite) => invite.id !== inviteId);

        setInvites(remaining);

        // sem convites não há aba de convites: sair dela evita uma tela vazia
        if (remaining.length === 0) setShowInvites(false);

        if (accepted) loadAll();
    }

    const filtered = useMemo(() => {
        const term = filters.search.trim().toLowerCase();

        const result = communities.filter((community) => {
            const matchesTerm =
                term === "" ||
                community.name?.toLowerCase().includes(term) ||
                community.description?.toLowerCase().includes(term);

            const matchesCategory =
                filters.categoryId === "" ||
                String(community.category_id) === filters.categoryId;

            const matchesMembership =
                filters.membership === "all" ||
                (filters.membership === "mine"
                    ? community.owner_id === myInfo?.id
                    // `viewer_role` vem da API: dono e admin também participam
                    : ["owner", "admin", "member"].includes(community.viewer_role ?? "none"));

            return matchesTerm && matchesCategory && matchesMembership;
        });

        if (filters.sort === "name") {
            return [...result].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "pt-BR"));
        }

        if (filters.sort === "members") {
            return [...result].sort((a, b) => (b.members_count ?? 0) - (a.members_count ?? 0));
        }

        // `recent`: a API já devolve na ordem de criação
        return result;
    }, [communities, filters, myInfo?.id]);

    /** id -> nome, para o selo de categoria dos cards. */
    const categoryNames = useMemo(() => {
        const map: Record<number, string> = {};
        categories.forEach((category) => {
            map[category.id] = category.name;
        });

        return map;
    }, [categories]);

    const counts = useMemo(() => {
        const joined = communities.filter((community) =>
            ["owner", "admin", "member"].includes(community.viewer_role ?? "none")
        ).length;

        const mine = communities.filter(
            (community) => community.owner_id === myInfo?.id
        ).length;

        return { total: communities.length, joined, mine };
    }, [communities, myInfo?.id]);

    /** Alterna o filtro de participação — clicar no chip ativo volta para "todas". */
    function toggleMembership(value: Filters["membership"]) {
        // os recortes são da listagem: escolher um sai da caixa de convites
        setShowInvites(false);

        setFilters((current) => ({
            ...current,
            membership: current.membership === value ? "all" : value,
        }));
    }

    function openModal() {
        setDraft(filters);
        setFilterModal(true);
    }

    /**
     * Chips do que está aplicado — o padrão fica de fora. A busca não vira chip:
     * o campo é visível no cabeçalho e já mostra (e limpa) o termo.
     */
    const activeFilters: ActiveFilter[] = [];

    if (filters.categoryId !== "") {
        const name = categories.find(
            (category) => String(category.id) === filters.categoryId
        )?.name;

        activeFilters.push({ id: "categoryId", label: `Categoria: ${name ?? filters.categoryId}` });
    }
    if (filters.membership !== EMPTY_FILTERS.membership) {
        activeFilters.push({ id: "membership", label: MEMBERSHIP_LABELS[filters.membership] });
    }
    if (filters.sort !== EMPTY_FILTERS.sort) {
        activeFilters.push({ id: "sort", label: SORT_LABELS[filters.sort] });
    }

    /** A busca fica fora dos chips, então entra à parte no estado vazio. */
    const hasFilters = activeFilters.length > 0 || filters.search.trim() !== "";

    function removeFilter(id: string) {
        setFilters((current) => ({ ...current, [id]: EMPTY_FILTERS[id as keyof Filters] }));
    }

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

    return (
        <>
            <Sidebar />

            <div className="flex flex-1 min-w-0 flex-col lg:flex-row gap-4">
                <Container className="w-full lg:w-[72%] rounded-card min-w-0" padding="p-0">

                    <PageHeader
                        icon={CommunityIcon}
                        title="Comunidades"
                        subtitle="Encontre gente que curte o que você curte."
                        action={
                            <ColorButton
                                onClick={() => setModalNewCommunity(true)}
                                className="shrink-0 px-4 text-sm font-semibold"
                            >
                                <PlusIcon className="size-4 shrink-0" />
                                Criar comunidade
                            </ColorButton>
                        }
                    >
                        <SearchField
                            value={filters.search}
                            onChange={(search) => setFilters({ ...filters, search })}
                            label="Buscar comunidades"
                            placeholder="Buscar por nome ou descrição"
                        />

                        {!loading && (
                            <div className="flex flex-row flex-wrap items-center gap-2">
                                <StatChip
                                    icon={CommunityIcon}
                                    label="no total"
                                    value={counts.total}
                                    active={!showInvites && filters.membership === "all"}
                                    onClick={() => toggleMembership("all")}
                                />
                                <StatChip
                                    icon={UsersIcon}
                                    label="que participo"
                                    value={counts.joined}
                                    active={!showInvites && filters.membership === "joined"}
                                    onClick={() => toggleMembership("joined")}
                                />
                                <StatChip
                                    icon={TrophyIcon}
                                    label="criadas por mim"
                                    value={counts.mine}
                                    active={!showInvites && filters.membership === "mine"}
                                    onClick={() => toggleMembership("mine")}
                                />

                                {/* só existe enquanto há convite pendente — um chip
                                    zerado levaria a uma tela vazia */}
                                {invites.length > 0 && (
                                    <StatChip
                                        icon={InboxIcon}
                                        label={invites.length === 1 ? "convite" : "convites"}
                                        value={invites.length}
                                        active={showInvites}
                                        onClick={() => setShowInvites((current) => !current)}
                                        badge={
                                            showInvites ? null : (
                                                <span
                                                    className="size-2 rounded-full bg-danger"
                                                    aria-hidden="true"
                                                />
                                            )
                                        }
                                    />
                                )}
                            </div>
                        )}

                        {/* A lista de categorias crescia sem limite no cabeçalho;
                            agora todos os filtros moram no modal e só o que está
                            aplicado volta como chip. Nos convites eles não valem:
                            a caixa é curta e não é uma listagem de comunidades */}
                        {!showInvites && (
                            <FilterBar
                                onOpen={openModal}
                                active={activeFilters}
                                onRemove={removeFilter}
                                onClearAll={() => setFilters(EMPTY_FILTERS)}
                                summary={
                                    loading
                                        ? "Carregando..."
                                        : `${filtered.length} ${filtered.length === 1 ? "comunidade" : "comunidades"}`
                                }
                            />
                        )}
                    </PageHeader>

                    <div className="p-4 sm:p-6">
                        {!loading && showInvites && (
                            <div className="flex flex-col gap-4">
                                <p className="text-sm text-content-muted">
                                    {invites.length === 1
                                        ? "Um amigo te convidou para uma comunidade."
                                        : `${invites.length} amigos te convidaram para comunidades.`}
                                </p>

                                <InviteList
                                    invites={invites}
                                    onResponded={handleInviteResponded}
                                />
                            </div>
                        )}

                        {loading && (
                            <div className={GRID}>
                                {/* o esqueleto acompanha o card: capa + corpo */}
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="overflow-hidden rounded-card border border-line bg-surface"
                                    >
                                        <Skeleton width="w-full" className="aspect-[16/9]" rounded="sm" />

                                        <div className="flex flex-col gap-2 p-4">
                                            <Skeleton width="w-2/3" height="h-4" rounded="field" />
                                            <Skeleton width="w-full" height="h-3" rounded="field" />
                                            <Skeleton width="w-1/3" height="h-3" rounded="field" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && !showInvites && filtered.length > 0 && (
                            <div className={GRID}>
                                <ListCommunities communities={filtered} categoryNames={categoryNames} />
                            </div>
                        )}

                        {!loading && !showInvites && filtered.length === 0 && (
                            <div className="flex flex-col items-center gap-3 rounded-card border border-dashed
                                border-line px-6 py-14 text-center">
                                <span className="flex size-16 items-center justify-center rounded-full
                                    bg-brand-subtle text-brand">
                                    <CommunityIcon className="size-8" />
                                </span>

                                <h2 className="text-base font-semibold">
                                    {hasFilters
                                        ? "Nenhum resultado"
                                        : "Nenhuma comunidade por aqui"}
                                </h2>

                                <p className="max-w-sm text-sm text-content-muted">
                                    {hasFilters
                                        ? "Nenhuma comunidade combina com a busca e os filtros aplicados."
                                        : "Crie a primeira e convide as pessoas para participar."}
                                </p>

                                {hasFilters ? (
                                    <Button
                                        variant="outline"
                                        size="md"
                                        onClick={() => setFilters(EMPTY_FILTERS)}
                                        className="mt-1 font-semibold"
                                    >
                                        Limpar filtros
                                    </Button>
                                ) : (
                                    <ColorButton
                                        onClick={() => setModalNewCommunity(true)}
                                        className="mt-1 px-4 text-sm font-semibold"
                                    >
                                        <PlusIcon className="size-4" />
                                        Criar comunidade
                                    </ColorButton>
                                )}
                            </div>
                        )}
                    </div>
                </Container>

                <aside
                    aria-label="Sugestões"
                    className="w-full flex flex-col lg:w-[28%] gap-4 lg:sticky lg:top-4 lg:self-start"
                >
                    <Container className="rounded-card" padding="p-4">
                        <div className="mb-4 flex flex-row items-center gap-2">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full
                                bg-brand-subtle text-brand">
                                <UsersIcon className="size-4" />
                            </span>

                            <div className="min-w-0">
                                <h2 className="text-base font-semibold leading-tight">Para você</h2>
                                <p className="text-xs text-content-muted">Comunidades sugeridas</p>
                            </div>
                        </div>

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

            <FilterModal
                isOpen={filterModal}
                onClose={() => setFilterModal(false)}
                onApply={() => {
                    // o termo de busca é do campo do cabeçalho: o modal não o toca
                    setFilters((current) => ({ ...draft, search: current.search }));
                    setFilterModal(false);
                }}
                onClear={() => setDraft({ ...EMPTY_FILTERS, search: draft.search })}
                title="Filtrar comunidades"
            >
                {/* a busca mora no campo do cabeçalho — aqui ficam só os recortes */}
                <Select
                    label="Categoria"
                    value={draft.categoryId}
                    onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
                    options={[
                        { value: "", label: "Todas as categorias" },
                        ...categories.map((category) => ({
                            value: String(category.id),
                            label: category.name,
                        })),
                    ]}
                />

                <Select
                    label="Participação"
                    value={draft.membership}
                    onChange={(e) =>
                        setDraft({ ...draft, membership: e.target.value as Filters["membership"] })
                    }
                    options={[
                        { value: "all", label: MEMBERSHIP_LABELS.all },
                        { value: "joined", label: MEMBERSHIP_LABELS.joined },
                        { value: "mine", label: MEMBERSHIP_LABELS.mine },
                    ]}
                />

                <Select
                    label="Ordenar por"
                    value={draft.sort}
                    onChange={(e) => setDraft({ ...draft, sort: e.target.value as Filters["sort"] })}
                    options={[
                        { value: "recent", label: SORT_LABELS.recent },
                        { value: "name", label: SORT_LABELS.name },
                        { value: "members", label: SORT_LABELS.members },
                    ]}
                />
            </FilterModal>

        </>
    );
}
