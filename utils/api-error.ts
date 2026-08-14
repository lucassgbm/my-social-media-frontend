/**
 * Leitura das respostas de erro da API Laravel.
 *
 * As telas de configurações usam o `api` do axios direto, em vez dos helpers
 * de `request.js` — elas precisam do corpo do 422 para colocar a mensagem no
 * campo certo, e os helpers engolem o erro. Estas funções evitam repetir o
 * mesmo encadeamento de `?.` em cada formulário.
 */

/** Mensagem geral do erro (`message` do Laravel), com um texto de reserva. */
export function errorMessage(error: unknown, fallback: string): string {
    const response = (error as { response?: { data?: { message?: string } } })?.response;

    return response?.data?.message ?? fallback;
}

/**
 * Erros por campo do 422, achatados para uma mensagem por campo — os
 * componentes de formulário exibem uma linha só sob o campo.
 *
 * @returns objeto vazio quando a resposta não é de validação
 */
export function fieldErrors<T extends string>(error: unknown): Partial<Record<T, string>> {
    const response = (error as {
        response?: { status?: number; data?: { errors?: Record<string, string[]> } };
    })?.response;

    if (response?.status !== 422 || !response?.data?.errors) return {};

    const entries = Object.entries(response.data.errors).map(
        ([field, messages]) => [field, messages[0]] as const
    );

    return Object.fromEntries(entries) as Partial<Record<T, string>>;
}

/** O desafio de 2FA morreu (expirou ou estourou as tentativas) e precisa ser refeito. */
export function isExpiredChallenge(error: unknown): boolean {
    const response = (error as { response?: { data?: { expired?: boolean } } })?.response;

    return response?.data?.expired === true;
}
