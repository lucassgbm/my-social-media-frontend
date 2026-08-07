import AuthForm from "../../../../components/login/auth-form";

export const metadata = {
    title: "Entrar",
};

export default function LoginPage() {
    return <AuthForm initialMode="login" />;
}
