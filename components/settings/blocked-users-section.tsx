'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "../remote-image";
import Button from "../button";
import Skeleton from "../skeleton";
import SearchField from "../filters/search-field";
import SettingsSection from "./settings-section";
import NoSymbolIcon from "../icons/no-symbol";
import api, { get } from "@/api/services/request";
import { errorMessage } from "../../utils/api-error";
import { locationOf, type Person } from "../../utils/friendship";
import { MIN_SEARCH_LENGTH, searchApiUrl, toSearchResults } from "../../utils/search";
import { useToaster } from "../../providers/toaster-provider";

/** Espera entre a última tecla e a chamada à API. */
const DEBOUNCE_MS = 350;

/** Quantas pessoas a busca oferece por vez — é um atalho, não uma listagem. */
const SEARCH_LIMIT = 6;

/**
 * Lista de bloqueados, com busca para bloquear alguém novo.
 *
 * A busca reaproveita GET /social-media/search, que já esconde quem está em
 * bloqueio com você — então quem acabou de ser bloqueado some dos resultados
 * sozinho e não aparece duas vezes na tela.
 */
export default function BlockedUsersSection() {
    const { showToast } = useToaster();

    const [blocked, setBlocked] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);

    const [term, setTerm] = useState("");
    const [results, setResults] = useState<Person[]>([]);
    const [searching, setSearching] = useState(false);

    /** Id em processamento — trava só o botão daquela linha. */
    const [pendingId, setPendingId] = useState<number | null>(null);

    useEffect(() => {
        loadBlocked();
    }, []);

    /** Descarta a resposta de um termo que já não é o atual. */
    const lastTerm = useRef("");

    useEffect(() => {
        const trimmed = term.trim();
        lastTerm.current = trimmed;

        if (trimmed.length < MIN_SEARCH_LENGTH) {
            setResults([]);
            setSearching(false);
            return;
        }

        setSearching(true);

        const timer = setTimeout(async () => {
            const response = await get(searchApiUrl(trimmed, SEARCH_LIMIT));

            // a resposta pode chegar fora de ordem: só a do termo atual vale
            if (lastTerm.current !== trimmed) return;

            setResults(toSearchResults(response, trimmed).people);
            setSearching(false);
        }, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [term]);

    async function loadBlocked() {
        const response = await get("/social-media/blocks");

        if (!response) {
            showToast({
                title: "Bloqueados",
                message: "Não foi possível carregar a sua lista.",
                status: "error",
            });
        }

        setBlocked(response?.data ?? []);
        setLoading(false);
    }

    async function block(person: Person) {
        setPendingId(person.id);

        try {
            await api.post("/social-media/blocks", { user_id: person.id });

            setBlocked((current) => [person, ...current]);
            // sai dos resultados na hora: a API já não o devolveria numa busca nova
            setResults((current) => current.filter((found) => found.id !== person.id));

            showToast({
                title: "Bloqueados",
                message: `${person.name} foi bloqueado.`,
                status: "success",
            });
        } catch (error) {
            showToast({
                title: "Bloqueados",
                message: errorMessage(error, "Não foi possível bloquear."),
                status: "error",
            });
        } finally {
            setPendingId(null);
        }
    }

    async function unblock(person: Person) {
        setPendingId(person.id);

        try {
            await api.delete(`/social-media/blocks/${person.id}`);

            setBlocked((current) => current.filter((other) => other.id !== person.id));

            showToast({
                title: "Bloqueados",
                message: `${person.name} foi desbloqueado. A amizade não volta sozinha.`,
                status: "success",
            });
        } catch (error) {
            showToast({
                title: "Bloqueados",
                message: errorMessage(error, "Não foi possível desbloquear."),
                status: "error",
            });
        } finally {
            setPendingId(null);
        }
    }

    const searchTooShort = term.trim() !== "" && term.trim().length < MIN_SEARCH_LENGTH;

    return (
        <SettingsSection
            icon={NoSymbolIcon}
            title="Pessoas bloqueadas"
            description="Quem você bloqueia deixa de aparecer no seu feed, nos stories e na busca — e você também some para essa pessoa. A amizade é desfeita."
        >
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <SearchField
                        value={term}
                        onChange={setTerm}
                        label="Buscar pessoa para bloquear"
                        placeholder="Buscar pessoa pelo nome"
                    />

                    {searchTooShort && (
                        <p className="text-xs text-content-subtle">
                            Digite ao menos {MIN_SEARCH_LENGTH} letras.
                        </p>
                    )}

                    {searching && <Skeleton height="h-14" rounded="card" />}

                    {!searching && results.length > 0 && (
                        <ul className="flex flex-col gap-2">
                            {results.map((person) => (
                                <PersonRow
                                    key={person.id}
                                    person={person}
                                    pending={pendingId === person.id}
                                    action={
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            disabled={pendingId === person.id}
                                            onClick={() => block(person)}
                                        >
                                            Bloquear
                                        </Button>
                                    }
                                />
                            ))}
                        </ul>
                    )}

                    {!searching && !searchTooShort && term.trim() !== "" && results.length === 0 && (
                        <p className="text-xs text-content-subtle">
                            Ninguém encontrado com esse nome.
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold">
                        Sua lista{!loading && blocked.length > 0 && ` (${blocked.length})`}
                    </h3>

                    {loading && <Skeleton height="h-14" rounded="card" />}

                    {!loading && blocked.length === 0 && (
                        <p className="rounded-card border border-dashed border-line px-4 py-6
                            text-center text-sm text-content-muted">
                            Você não bloqueou ninguém.
                        </p>
                    )}

                    {!loading && blocked.length > 0 && (
                        <ul className="flex flex-col gap-2">
                            {blocked.map((person) => (
                                <PersonRow
                                    key={person.id}
                                    person={person}
                                    pending={pendingId === person.id}
                                    // sem link para o perfil: ele responde 403 enquanto
                                    // o bloqueio existir
                                    linkToProfile={false}
                                    action={
                                        <Button
                                            size="sm"
                                            disabled={pendingId === person.id}
                                            onClick={() => unblock(person)}
                                        >
                                            Desbloquear
                                        </Button>
                                    }
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </SettingsSection>
    );
}

/** Linha de pessoa: foto, nome, local e a ação da vez. */
function PersonRow({
    person,
    action,
    pending,
    linkToProfile = true,
}: {
    person: Person;
    action: React.ReactNode;
    pending: boolean;
    linkToProfile?: boolean;
}) {
    const location = locationOf(person);

    const identity = (
        <>
            <Image
                src={person.photo || "/imgs/placeholder.png"}
                alt=""
                width={40}
                height={40}
                className="size-10 shrink-0 rounded-full object-cover"
            />

            <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{person.name}</span>
                {location && (
                    <span className="block truncate text-xs text-content-muted">{location}</span>
                )}
            </span>
        </>
    );

    return (
        <li
            className={`flex flex-row items-center justify-between gap-3 rounded-card
                border border-line bg-surface p-2 pr-3 ${pending ? "opacity-60" : ""}`}
        >
            {linkToProfile ? (
                <Link
                    href={`/social-media/profile/${person.id}`}
                    className="flex min-w-0 flex-1 flex-row items-center gap-3 rounded-field
                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                >
                    {identity}
                </Link>
            ) : (
                <div className="flex min-w-0 flex-1 flex-row items-center gap-3">{identity}</div>
            )}

            {action}
        </li>
    );
}
