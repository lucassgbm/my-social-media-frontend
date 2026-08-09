'use client';

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "../../../../../../../../components/remote-image";
import Container from "../../../../../../../../components/container";
import Sidebar from "../../../../../../../../components/sidebar";
import SidebarFooter from "../../../../../../../../components/sidebar-footer";
import Button from "../../../../../../../../components/button";
import FormButtom from "../../../../../../../../components/form-buttom";
import Textarea from "../../../../../../../../components/textarea";
import Skeleton from "../../../../../../../../components/skeleton";
import RingImage from "../../../../../../../../components/ring-image";
import ArrowLeftIcon from "../../../../../../../../components/icons/arrow-left";
import MessageIcon from "../../../../../../../../components/icons/message";
import CloseIcon from "../../../../../../../../components/icons/close";
import { get, post, remove } from "@/api/services/request";
import { useToaster } from "../../../../../../../../providers/toaster-provider";
import type { CommunityTopic, CommunityTopicComment } from "../../../../../../../../utils/community";

const COMMENT_MAX = 2000;

/**
 * Tópico aberto: a conversa da comunidade.
 *
 * Quem administra abre o tópico (na página da comunidade); aqui é onde os
 * membros participam. Quem não entrou na comunidade lê, mas não comenta — o
 * backend decide isso e manda em `can_comment`.
 */
export default function TopicPage() {
    const { showToast } = useToaster();
    const router = useRouter();

    const params = useParams<{ communityId: string; topicId: string }>();
    const communityId = params?.communityId ?? "";
    const topicId = params?.topicId ?? "";

    const [topic, setTopic] = useState<CommunityTopic | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const loadTopic = useCallback(async () => {
        setLoading(true);

        const response = await get(`/social-media/community/${communityId}/topics/${topicId}`);

        // get() devolve undefined tanto no 404 quanto em falha de rede
        if (!response?.data) setNotFound(true);
        else setTopic(response.data as CommunityTopic);

        setLoading(false);
    }, [communityId, topicId]);

    useEffect(() => {
        loadTopic();
    }, [loadTopic]);

    async function handleComment(e: React.FormEvent) {
        e.preventDefault();

        if (content.trim() === "") return;

        setSending(true);

        const response = await post(
            `/social-media/community/${communityId}/topics/${topicId}/comments`,
            { content }
        );

        setSending(false);

        if (!response?.data) {
            showToast({
                title: "Tópico",
                message: "Não foi possível enviar o comentário.",
                status: "error",
            });
            return;
        }

        const comment = response.data as CommunityTopicComment;

        // acrescenta no fim: a conversa é exibida do mais antigo para o mais novo
        setTopic((current) =>
            current
                ? {
                    ...current,
                    comments: [...(current.comments ?? []), comment],
                    comments_count: (current.comments_count ?? 0) + 1,
                }
                : current
        );
        setContent("");
    }

    async function handleDeleteComment(commentId: number) {
        setDeletingId(commentId);

        try {
            await remove(
                `/social-media/community/${communityId}/topics/${topicId}/comments/${commentId}`
            );

            setTopic((current) =>
                current
                    ? {
                        ...current,
                        comments: (current.comments ?? []).filter((item) => item.id !== commentId),
                    }
                    : current
            );
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({
                title: "Tópico",
                message: error?.response?.data?.message ?? "Não foi possível apagar o comentário.",
                status: "error",
            });
        } finally {
            setDeletingId(null);
        }
    }

    async function handleDeleteTopic() {
        try {
            await remove(`/social-media/community/${communityId}/topics/${topicId}`);

            showToast({ title: "Tópico", message: "Tópico removido.", status: "success" });
            router.push(`/social-media/communities/${communityId}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({
                title: "Tópico",
                message: error?.response?.data?.message ?? "Não foi possível apagar o tópico.",
                status: "error",
            });
        }
    }

    const comments = topic?.comments ?? [];

    return (
        <>
            <Sidebar />

            <div className="flex flex-1 min-w-0 flex-col xl:flex-row gap-4">
                <div className="flex-1 min-w-0 flex flex-col gap-4">

                    <Container className="rounded-card" padding="p-4" as="section">
                        {/* identifica de qual comunidade é a conversa antes de
                            qualquer coisa — o link de voltar sozinho não dizia */}
                        <Link
                            href={`/social-media/communities/${communityId}`}
                            className="flex flex-row items-center gap-3 rounded-card p-2 -m-2 mb-2
                                hover:bg-surface-2 transition-colors
                                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                        >
                            <Image
                                src={topic?.community?.photo || "/imgs/placeholder.png"}
                                alt=""
                                width={48}
                                height={48}
                                sizes="48px"
                                className="size-12 shrink-0 rounded-card object-cover bg-surface-2"
                            />
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs text-content-muted">Comunidade</span>
                                <span className="text-base font-semibold truncate">
                                    {topic?.community?.name ?? "Carregando..."}
                                </span>
                            </div>
                        </Link>

                        <Link
                            href={`/social-media/communities/${communityId}`}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-brand
                                rounded-field px-2 py-1 -ml-2 hover:bg-surface-2 transition-colors
                                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                        >
                            <ArrowLeftIcon className="size-4" />
                            Voltar para a comunidade
                        </Link>

                        {loading && (
                            <div className="flex flex-col gap-3 mt-4">
                                <Skeleton width="w-2/3" height="h-8" rounded="field" />
                                <Skeleton width="w-full" height="h-20" rounded="card" />
                            </div>
                        )}

                        {!loading && notFound && (
                            <div className="flex flex-col items-center gap-3 py-12 text-center">
                                <MessageIcon className="size-10 text-content-subtle" />
                                <h1 className="text-lg font-semibold">Tópico não encontrado</h1>
                                <p className="max-w-sm text-sm text-content-muted">
                                    Ele pode ter sido removido por quem administra a comunidade.
                                </p>
                            </div>
                        )}

                        {!loading && topic && (
                            <div className="mt-4 flex flex-col gap-3">
                                <div className="flex flex-row items-start justify-between gap-3">
                                    <h1 className="text-2xl font-semibold break-words">{topic.title}</h1>

                                    {topic.can_delete && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="shrink-0 text-danger"
                                            onClick={handleDeleteTopic}
                                        >
                                            Apagar tópico
                                        </Button>
                                    )}
                                </div>

                                {topic.author && (
                                    <div className="flex flex-row items-center gap-2 text-content-muted">
                                        <Image
                                            src={topic.author.photo || "/imgs/placeholder.png"}
                                            alt=""
                                            width={28}
                                            height={28}
                                            sizes="28px"
                                            className="size-7 rounded-full object-cover"
                                        />
                                        <span className="text-sm">
                                            Aberto por{" "}
                                            <Link
                                                href={`/social-media/profile/${topic.author.id}`}
                                                className="font-semibold text-content hover:underline"
                                            >
                                                {topic.author.name}
                                            </Link>
                                        </span>
                                    </div>
                                )}

                                {topic.description && (
                                    <p className="text-sm text-content whitespace-pre-line break-words">
                                        {topic.description}
                                    </p>
                                )}
                            </div>
                        )}
                    </Container>

                    {!loading && topic && (
                        <Container className="rounded-card" padding="p-4" as="section">
                            <h2 className="text-lg font-semibold mb-4">
                                {comments.length === 1 ? "1 comentário" : `${comments.length} comentários`}
                            </h2>

                            {comments.length === 0 && (
                                <div className="flex flex-col items-center gap-3 py-10 text-center">
                                    <MessageIcon className="size-10 text-content-subtle" />
                                    <h3 className="text-base font-semibold">Nenhum comentário ainda</h3>
                                    <p className="max-w-xs text-sm text-content-muted">
                                        {topic.can_comment
                                            ? "Seja o primeiro a responder."
                                            : "Entre na comunidade para participar da conversa."}
                                    </p>
                                </div>
                            )}

                            <ul className="flex flex-col gap-4 list-none">
                                {comments.map((comment) => (
                                    <li
                                        key={comment.id}
                                        className="flex flex-row gap-3 rounded-card border border-line p-3"
                                    >
                                        <Link
                                            href={`/social-media/profile/${comment.author?.id ?? ""}`}
                                            className="shrink-0 rounded-full
                                                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                        >
                                            <RingImage className="w-10">
                                                <Image
                                                    src={comment.author?.photo || "/imgs/placeholder.png"}
                                                    alt=""
                                                    width={40}
                                                    height={40}
                                                    sizes="40px"
                                                    className="w-full aspect-square rounded-full object-cover"
                                                />
                                            </RingImage>
                                        </Link>

                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="text-sm font-semibold truncate">
                                                {comment.author?.name ?? "Alguém"}
                                            </span>
                                            <p className="text-sm text-content whitespace-pre-line break-words">
                                                {comment.content}
                                            </p>
                                        </div>

                                        {comment.can_delete && (
                                            <Button
                                                aria-label="Apagar comentário"
                                                className="shrink-0 self-start"
                                                disabled={deletingId === comment.id}
                                                onClick={() => handleDeleteComment(comment.id)}
                                            >
                                                <CloseIcon className="size-3" />
                                            </Button>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            {topic.can_comment ? (
                                <form onSubmit={handleComment} className="mt-4 flex flex-col gap-2">
                                    <Textarea
                                        label="Seu comentário"
                                        rows={3}
                                        maxLength={COMMENT_MAX}
                                        showCount
                                        placeholder="Escreva uma resposta..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                    <div className="flex justify-end">
                                        <FormButtom
                                            label="Comentar"
                                            type="submit"
                                            loading={sending}
                                            disabled={content.trim() === ""}
                                        />
                                    </div>
                                </form>
                            ) : (
                                <p className="mt-4 rounded-card border border-dashed border-line p-4 text-center
                                    text-sm text-content-muted">
                                    Entre na comunidade para comentar neste tópico.
                                </p>
                            )}
                        </Container>
                    )}
                </div>

                <aside className="w-full xl:w-[340px] xl:shrink-0 flex flex-col gap-4">
                    <SidebarFooter />
                </aside>
            </div>
        </>
    );
}
