'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "../button";
import OverlayButton from "./overlay-button";
import CameraIcon from "../icons/camera";
import CloseIcon from "../icons/close";
import PhotoIcon from "../icons/photo";
import ArrowPathIcon from "../icons/arrow-path";
import AirPlaneIcon from "../icons/airplane";
import TrashIcon from "../icons/trash";
import LoadingSpinner from "../loading-spinner";
import { postFormData } from "@/api/services/request";
import { useToaster } from "../../providers/toaster-provider";
import { STORY_CAPTION_MAX, STORY_LIFETIME_HOURS } from "../../utils/story";

type StoryComposerProps = {
    onClose: () => void;
    /** Publicou: a barra recarrega para o story novo aparecer. */
    onCreated: () => void;
};

/** JPEG a 90%: uma foto em PNG passa fácil do limite de 8 MB do backend. */
const CAPTURE_TYPE = "image/jpeg";
const CAPTURE_QUALITY = 0.9;

/**
 * Tela de publicar story.
 *
 * Duas etapas: escolher a foto (câmera ou arquivo) e revisar antes de mandar.
 *
 * A versão anterior só funcionava com câmera — sem permissão, a tela ficava
 * num retângulo preto sem saída — e o envio não dava sinal nenhum: sucesso e
 * erro terminavam num console.log, com o modal aberto do mesmo jeito.
 */
export default function StoryComposer({ onClose, onCreated }: StoryComposerProps) {
    const { showToast } = useToaster();

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [photo, setPhoto] = useState<Blob | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
    /** null enquanto a câmera não respondeu; string é o motivo de não haver vídeo. */
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (videoRef.current) videoRef.current.srcObject = null;
    }, []);

    /**
     * Liga a câmera enquanto não há foto escolhida.
     *
     * O `cancelled` é o que faltava antes: fechar o modal durante o
     * `getUserMedia` deixava a câmera ligada, com a luz acesa e sem dono.
     */
    useEffect(() => {
        if (photo) return;

        let cancelled = false;

        async function start() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode },
                    audio: false,
                });

                if (cancelled) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                streamRef.current = stream;
                setCameraError(null);

                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch {
                if (cancelled) return;

                setCameraError(
                    "Não foi possível abrir a câmera. Você ainda pode enviar uma imagem do dispositivo."
                );
            }
        }

        start();

        return () => {
            cancelled = true;
            stopCamera();
        };
    }, [photo, facingMode, stopCamera]);

    /** A URL do preview é criada à mão, então precisa ser devolvida à mão. */
    useEffect(() => {
        if (!photo) {
            setPreview(null);
            return;
        }

        const url = URL.createObjectURL(photo);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [photo]);

    /** Esc fecha, como nos outros modais. */
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape" && !sending) onClose();
        }

        window.addEventListener("keydown", handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [onClose, sending]);

    function capture() {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || video.videoWidth === 0) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        if (!context) return;

        // a prévia da câmera frontal é espelhada; sem espelhar também na
        // captura, a foto sai invertida em relação ao que a pessoa viu
        if (facingMode === "user") {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }

        context.drawImage(video, 0, 0);

        canvas.toBlob(
            (blob) => {
                if (blob) setPhoto(blob);
            },
            CAPTURE_TYPE,
            CAPTURE_QUALITY
        );
    }

    function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            // na etapa da câmera não há onde encaixar um aviso inline
            showToast({
                title: "Story",
                message: "O story precisa ser uma imagem.",
                status: "error",
            });
            return;
        }

        setError(null);
        setPhoto(file);

        // permite reescolher o mesmo arquivo depois de descartar
        event.target.value = "";
    }

    async function publish() {
        if (!photo || sending) return;

        setSending(true);
        setError(null);

        const formData = new FormData();
        // o nome do campo é o da coluna, que é o que o StoryRequest valida
        formData.append("photo_path", photo, "story.jpg");
        formData.append("description", description);

        try {
            const response = await postFormData("/social-media/story", formData);

            if (response?.errors) {
                const first = Object.values(response.errors)[0];
                setError(Array.isArray(first) ? String(first[0]) : String(first));
                return;
            }

            showToast({
                title: "Story",
                message: `Publicado! Ele fica no ar por ${STORY_LIFETIME_HOURS}h.`,
                status: "success",
            });

            onCreated();
            onClose();
        } catch {
            setError("Não foi possível publicar agora. Tente de novo.");
        } finally {
            setSending(false);
        }
    }

    const remaining = STORY_CAPTION_MAX - description.length;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Publicar um story"
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-0 sm:p-4"
        >
            <div className="relative flex h-full w-full max-w-[440px] flex-col overflow-hidden
                bg-neutral-950 text-white sm:h-[92vh] sm:rounded-card sm:shadow-lg">

                {/* --- Cabeçalho --------------------------------------------- */}
                <header className="absolute inset-x-0 top-0 z-20 flex flex-row items-center
                    justify-between gap-3 bg-gradient-to-b from-black/70 to-transparent p-3">
                    <h2 className="text-sm font-semibold drop-shadow">
                        {photo ? "Revisar story" : "Novo story"}
                    </h2>

                    <OverlayButton label="Fechar" onClick={onClose} disabled={sending}>
                        <CloseIcon className="size-4" />
                    </OverlayButton>
                </header>

                {/* --- Etapa 1: escolher ------------------------------------- */}
                {!photo && (
                    <>
                        <div className="relative flex-1 overflow-hidden bg-neutral-900">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                // espelhado como um espelho de verdade: é o que se
                                // espera da câmera frontal
                                className={`size-full object-cover ${facingMode === "user" ? "-scale-x-100" : ""}`}
                            />

                            {cameraError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center
                                    gap-3 bg-neutral-900 px-8 text-center">
                                    <span className="flex size-16 items-center justify-center rounded-full
                                        bg-white/10 text-white/70">
                                        <CameraIcon className="size-8" />
                                    </span>

                                    <p className="text-sm text-white/70">{cameraError}</p>
                                </div>
                            )}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-row items-center
                            justify-between gap-4 bg-gradient-to-t from-black/80 to-transparent p-5 pt-16">

                            <OverlayButton
                                size="md"
                                label="Enviar uma imagem do dispositivo"
                                onClick={() => fileRef.current?.click()}
                            >
                                <PhotoIcon className="size-5" />
                            </OverlayButton>

                            {/* obturador: grande e no centro, como manda o gesto */}
                            <button
                                type="button"
                                onClick={capture}
                                disabled={!!cameraError}
                                aria-label="Tirar foto"
                                className="size-16 shrink-0 rounded-full bg-white ring-4 ring-white/30
                                    cursor-pointer transition-transform hover:scale-105 active:scale-95
                                    disabled:pointer-events-none disabled:opacity-40
                                    focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                            />

                            <OverlayButton
                                size="md"
                                label="Alternar entre as câmeras"
                                disabled={!!cameraError}
                                onClick={() =>
                                    setFacingMode((current) => (current === "user" ? "environment" : "user"))
                                }
                            >
                                <ArrowPathIcon className="size-5" />
                            </OverlayButton>
                        </div>
                    </>
                )}

                {/* --- Etapa 2: revisar -------------------------------------- */}
                {photo && preview && (
                    <>
                        <div className="relative flex-1 overflow-hidden bg-neutral-900">
                            {/* next/image não acrescenta nada num blob local, e o
                                otimizador nem processa blob: */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={preview} alt="Prévia do story" className="size-full object-cover" />
                        </div>

                        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-3
                            bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 pt-16">

                            {error && (
                                <p role="alert" className="rounded-field bg-danger/90 px-3 py-2 text-xs text-white">
                                    {error}
                                </p>
                            )}

                            <div className="flex flex-row items-end gap-2">
                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                    <label htmlFor="story-caption" className="sr-only">
                                        Legenda do story
                                    </label>

                                    <textarea
                                        id="story-caption"
                                        rows={1}
                                        value={description}
                                        maxLength={STORY_CAPTION_MAX}
                                        onChange={(event) => setDescription(event.target.value)}
                                        placeholder="Escreva uma legenda (opcional)"
                                        className="w-full resize-none rounded-card border border-white/20
                                            bg-black/50 px-4 py-3 text-sm text-white placeholder:text-white/50
                                            outline-none focus-visible:border-white/60"
                                    />

                                    {/* só aparece perto do limite: contador sempre
                                        visível vira ruído numa legenda opcional */}
                                    {remaining <= 40 && (
                                        <span className="self-end text-[11px] text-white/60">
                                            {remaining}
                                        </span>
                                    )}
                                </div>

                                <OverlayButton
                                    size="md"
                                    label="Descartar a foto e voltar para a câmera"
                                    disabled={sending}
                                    onClick={() => setPhoto(null)}
                                >
                                    <TrashIcon className="size-5" />
                                </OverlayButton>

                                <Button
                                    variant="primary"
                                    onClick={publish}
                                    disabled={sending}
                                    aria-label="Publicar story"
                                    className="size-12 shrink-0"
                                >
                                    {sending ? <LoadingSpinner /> : <AirPlaneIcon className="size-5" />}
                                </Button>
                            </div>

                            <p className="text-center text-[11px] text-white/50">
                                Seu story fica visível por {STORY_LIFETIME_HOURS} horas.
                            </p>
                        </div>
                    </>
                )}

                <canvas ref={canvasRef} className="hidden" />

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFile}
                />
            </div>
        </div>
    );
}
