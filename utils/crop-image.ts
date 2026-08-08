import type { Area } from "react-easy-crop";

type CropOptions = {
    /** Recorte em pixels da imagem original, como devolvido pelo react-easy-crop. */
    crop: Area;
    /** Rotação aplicada no editor, em graus. */
    rotation?: number;
    /** Nome do arquivo original — a extensão é ajustada ao formato de saída. */
    sourceName?: string;
    /** MIME do arquivo original. PNG é preservado; o resto vira JPEG. */
    sourceType?: string;
    /** Limite do maior lado da imagem gerada, em px. */
    maxSize?: number;
    /** Qualidade do JPEG (ignorada em PNG). */
    quality?: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", () => reject(new Error("Falha ao carregar a imagem")));
        image.src = src;
    });
}

function toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/** Caixa que a imagem ocupa depois de girada — sem isso o giro corta as pontas. */
function rotatedSize(width: number, height: number, rotation: number) {
    const rad = toRadians(rotation);

    return {
        width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
        height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
    };
}

/**
 * Gera o arquivo recortado a partir da imagem original.
 *
 * São dois canvas de propósito: o primeiro aplica a rotação sobre a imagem
 * inteira, o segundo extrai a área escolhida já em coordenadas da imagem girada
 * — que é o sistema em que o react-easy-crop devolve `croppedAreaPixels`.
 *
 * PNG é mantido para não perder transparência (o JPEG a pintaria de preto);
 * qualquer outro formato sai como JPEG, bem menor para foto de perfil.
 */
export async function cropImage(
    src: string,
    {
        crop,
        rotation = 0,
        sourceName = "imagem",
        sourceType = "image/jpeg",
        maxSize = 512,
        quality = 0.9,
    }: CropOptions
): Promise<File> {
    const image = await loadImage(src);

    const rotated = rotatedSize(image.width, image.height, rotation);

    const rotatedCanvas = document.createElement("canvas");
    const rotatedContext = rotatedCanvas.getContext("2d");
    if (!rotatedContext) throw new Error("Canvas indisponível neste navegador");

    rotatedCanvas.width = Math.round(rotated.width);
    rotatedCanvas.height = Math.round(rotated.height);

    // gira em torno do centro da caixa e só então desenha a imagem
    rotatedContext.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
    rotatedContext.rotate(toRadians(rotation));
    rotatedContext.translate(-image.width / 2, -image.height / 2);
    rotatedContext.drawImage(image, 0, 0);

    // reduz o recorte para no máximo maxSize sem nunca ampliar
    const scale = Math.min(1, maxSize / Math.max(crop.width, crop.height));
    const outputWidth = Math.max(1, Math.round(crop.width * scale));
    const outputHeight = Math.max(1, Math.round(crop.height * scale));

    const outputCanvas = document.createElement("canvas");
    const outputContext = outputCanvas.getContext("2d");
    if (!outputContext) throw new Error("Canvas indisponível neste navegador");

    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;

    outputContext.imageSmoothingQuality = "high";
    outputContext.drawImage(
        rotatedCanvas,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        outputWidth,
        outputHeight
    );

    const isPng = sourceType === "image/png";
    const mimeType = isPng ? "image/png" : "image/jpeg";

    const blob = await new Promise<Blob | null>((resolve) =>
        outputCanvas.toBlob(resolve, mimeType, isPng ? undefined : quality)
    );

    if (!blob) throw new Error("Não foi possível gerar a imagem recortada");

    const baseName = sourceName.replace(/\.[^./\\]+$/, "") || "imagem";
    const extension = isPng ? "png" : "jpg";

    return new File([blob], `${baseName}.${extension}`, { type: mimeType });
}

export default cropImage;
