'use client';

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import Modal from "./modal";
import Button from "./button";
import FormButtom from "./form-buttom";
import ArrowPathIcon from "./icons/arrow-path";
import { cropImage } from "../utils/crop-image";

type ImageCropperProps = {
    isOpen: boolean;
    /** Arquivo original escolhido pelo usuário. */
    file: File | null;
    onCancel: () => void;
    /** Recebe um novo File já recortado — o original não é alterado. */
    onConfirm: (croppedFile: File) => void;
    title?: string;
    /** Proporção do recorte. 1 = quadrado. */
    aspect?: number;
    cropShape?: "rect" | "round";
    /** Limite do maior lado da imagem gerada, em px. */
    outputSize?: number;
    confirmLabel?: string;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

/**
 * Editor de recorte reutilizável, montado sobre o <Modal> da aplicação.
 *
 * O componente é controlado: quem usa guarda o arquivo original e decide o que
 * fazer com o recorte, então dá para reabrir o editor e reenquadrar quantas
 * vezes quiser sem perder qualidade (o recorte sempre parte do original).
 */
export default function ImageCropper({
    isOpen,
    file,
    onCancel,
    onConfirm,
    title = "Recortar imagem",
    aspect = 1,
    cropShape = "round",
    outputSize = 512,
    confirmLabel = "Aplicar recorte",
}: ImageCropperProps) {
    const [source, setSource] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(MIN_ZOOM);
    const [rotation, setRotation] = useState(0);
    const [area, setArea] = useState<Area | null>(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Um object URL por arquivo, revogado na troca e no unmount. Cada arquivo
    // novo recomeça com o enquadramento zerado.
    useEffect(() => {
        if (!file) {
            setSource(null);
            return;
        }

        const url = URL.createObjectURL(file);

        setSource(url);
        setCrop({ x: 0, y: 0 });
        setZoom(MIN_ZOOM);
        setRotation(0);
        setArea(null);
        setError(null);

        return () => URL.revokeObjectURL(url);
    }, [file]);

    const handleCropComplete = useCallback((_area: Area, areaInPixels: Area) => {
        setArea(areaInPixels);
    }, []);

    async function handleConfirm() {
        if (!source || !file || !area) return;

        setProcessing(true);
        setError(null);

        try {
            const cropped = await cropImage(source, {
                crop: area,
                rotation,
                sourceName: file.name,
                sourceType: file.type,
                maxSize: outputSize,
            });

            onConfirm(cropped);
        } catch {
            setError("Não foi possível recortar a imagem. Tente outro arquivo.");
        } finally {
            setProcessing(false);
        }
    }

    if (!isOpen || !file) return null;

    return (
        <Modal isOpen={isOpen} onClose={onCancel} title={title} width="sm:w-[560px]">
            <div className="flex flex-col gap-4">

                {/* O Cropper se posiciona em absolute: precisa de um pai relative
                    com altura definida */}
                <div className="relative w-full h-[280px] sm:h-[360px] overflow-hidden rounded-card bg-black">
                    {source && (
                        <Cropper
                            image={source}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={aspect}
                            cropShape={cropShape}
                            minZoom={MIN_ZOOM}
                            maxZoom={MAX_ZOOM}
                            showGrid={false}
                            restrictPosition
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={handleCropComplete}
                        />
                    )}
                </div>

                <p className="text-xs text-content-muted">
                    Arraste para posicionar e use o controle abaixo para aproximar.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label htmlFor="cropper-zoom" className="font-semibold text-xs shrink-0">
                        Zoom
                    </label>
                    <input
                        id="cropper-zoom"
                        type="range"
                        min={MIN_ZOOM}
                        max={MAX_ZOOM}
                        step={0.05}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full accent-brand cursor-pointer"
                    />

                    <Button
                        variant="secondary"
                        size="sm"
                        // 90° por clique: cobre foto deitada sem exigir precisão
                        onClick={() => setRotation((current) => (current + 90) % 360)}
                        className="shrink-0"
                    >
                        <ArrowPathIcon className="size-4" />
                        Girar
                    </Button>
                </div>

                {error && (
                    <span role="alert" className="text-xs text-danger">
                        {error}
                    </span>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <Button variant="ghost" size="md" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <FormButtom
                        label={confirmLabel}
                        type="button"
                        loading={processing}
                        disabled={!area}
                        onClick={handleConfirm}
                    />
                </div>
            </div>
        </Modal>
    );
}
