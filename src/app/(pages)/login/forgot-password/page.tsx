import AuthForm from "../../../../../components/login/auth-form";

export const metadata = {
    title: "Recuperar senha",
};

/**
 * Mesma tela de /login, abrindo direto na recuperação de senha — a rota é
 * mantida para não quebrar links existentes (e-mails, favoritos).
 */
export default function ForgotPasswordPage() {
    return <AuthForm initialMode="forgot" />;
}
