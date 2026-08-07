import NextImage, { type ImageProps } from "next/image";

/**
 * Decide se vale a pena passar a imagem pelo otimizador do Next.
 *
 * O otimizador usa a URL inteira como chave de cache. URLs pré-assinadas
 * (R2/S3) trocam de assinatura a cada resposta da API, então a chave muda
 * sempre: nunca há cache hit e cada render obriga o servidor a baixar e
 * reencodar a imagem. Nesses casos servir direto sai mais barato.
 *
 * Fontes estáveis (/imgs/*, mocks do Unsplash) continuam otimizadas.
 */
export function shouldSkipOptimization(src: ImageProps["src"]): boolean {
  if (typeof src !== "string") return false;

  // blob:/data: não passam pelo otimizador de jeito nenhum
  if (src.startsWith("blob:") || src.startsWith("data:")) return true;

  // caminhos locais (/imgs/...) são estáticos e valem a pena otimizar
  if (!/^https?:\/\//i.test(src)) return false;

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return false;
  }

  // qualquer URL pré-assinada no padrão AWS SigV4
  if (url.searchParams.has("X-Amz-Signature") || url.searchParams.has("X-Amz-Credential")) {
    return true;
  }

  // storage do R2 mesmo sem assinatura na query
  return url.hostname.endsWith(".r2.cloudflarestorage.com");
}

/**
 * Drop-in do next/image. Mesma API — só decide o `unoptimized` sozinho
 * quando a origem não se beneficia da otimização.
 * Passar `unoptimized` explicitamente continua tendo precedência.
 */
export default function RemoteImage({ src, unoptimized, ...rest }: ImageProps) {
  return (
    <NextImage
      src={src}
      unoptimized={unoptimized ?? shouldSkipOptimization(src)}
      {...rest}
    />
  );
}
