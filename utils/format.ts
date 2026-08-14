/**
 * Formatação de números para espaços estreitos (sidebar, chips, badges).
 */

/**
 * Número compacto: exato abaixo de mil, senão a unidade arredondada para baixo
 * com "+".
 *
 * 213 → "213" · 1_500 → "1k+" · 12_300 → "12k+" · 2_500_000 → "2M+"
 *
 * Arredonda para baixo de propósito: "1k+" promete no mínimo o que mostra, e o
 * rótulo cabe em duas ou três letras dentro da coluna recolhida — nenhuma
 * contagem estoura a largura, por maior que fique.
 */
export function compactCount(value: number | null | undefined): string {
    const count = Math.max(0, Math.trunc(value ?? 0));

    if (count >= 1_000_000) return `${Math.floor(count / 1_000_000)}M+`;
    if (count >= 1_000) return `${Math.floor(count / 1_000)}k+`;

    return String(count);
}
