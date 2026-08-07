import AuthForm from "../../../../../components/login/auth-form";

export const metadata = {
    title: "Criar conta",
};

/**
 * Mesma tela de /login, apenas abrindo na aba de cadastro — a rota é mantida
 * para não quebrar links existentes.
 */
export default function RegisterPage() {
    return <AuthForm initialMode="register" />;
}
