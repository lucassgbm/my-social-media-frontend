'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "../remote-image";
import HeaderLogin from "./header-login";
import Input from "../input";
import FormButtom from "../form-buttom";
import CodeInput, { CODE_LENGTH } from "../code-input";
import { auth } from "@/api/services/auth";
import api, { post, postFormData } from "@/api/services/request";
import { errorMessage, fieldErrors, isExpiredChallenge } from "../../utils/api-error";
import { useToaster } from "../../providers/toaster-provider";

/** `two-factor` é o segundo passo do login, não uma aba própria. */
export type AuthMode = "login" | "register" | "forgot" | "two-factor";

type LoginErrors = { email?: string; password?: string };
type RegisterErrors = {
    name?: string;
    email?: string;
    password?: string;
    birthdate?: string;
};
type ForgotErrors = { email?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * O cadastro não pede nome, mas a coluna `users.name` é NOT NULL e a aplicação
 * usa o nome nas rotas de perfil. Derivamos um nome inicial da parte local do
 * e-mail; o usuário pode trocá-lo depois em /social-media/profile/edit.
 */
function nameFromEmail(email: string): string {
    const localPart = email.split("@")[0] ?? "";
    const cleaned = localPart.replace(/[._-]+/g, " ").trim();

    return cleaned === ""
        ? "Novo usuário"
        : cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Tela única de autenticação: entrar, criar conta e recuperar senha compartilham
 * layout, painel lateral e toaster — antes eram três páginas com marcação e
 * estilos duplicados. Recuperar senha é um modo desta mesma tela, sem navegação.
 */
export default function AuthForm({ initialMode = "login" }: { initialMode?: AuthMode }) {
    const { showToast, dismissAll } = useToaster();

    const router = useRouter();

    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [loading, setLoading] = useState(false);

    // --- login -------------------------------------------------------------
    const [login, setLogin] = useState({ email: "", password: "" });
    const [loginErrors, setLoginErrors] = useState<LoginErrors>({});

    // --- cadastro ----------------------------------------------------------
    const [register, setRegister] = useState({
        email: "",
        password: "",
        birthdate: "",
    });
    const [registerErrors, setRegisterErrors] = useState<RegisterErrors>({});

    // --- recuperação de senha ----------------------------------------------
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotErrors, setForgotErrors] = useState<ForgotErrors>({});

    // --- verificação em duas etapas ----------------------------------------
    // o desafio identifica o login em andamento; ainda não há sessão nenhuma
    const [challenge, setChallenge] = useState("");
    const [emailHint, setEmailHint] = useState("");
    const [code, setCode] = useState("");
    const [codeError, setCodeError] = useState<string | undefined>();

    function switchMode(next: AuthMode) {
        setMode(next);
        dismissAll();
        setLoginErrors({});
        setRegisterErrors({});
        setForgotErrors({});

        // sair do segundo passo abandona o desafio: voltar exige a senha de novo
        if (next !== "two-factor") {
            setChallenge("");
            setCode("");
            setCodeError(undefined);
        }
    }

    // --- validações --------------------------------------------------------
    function validateLogin(): LoginErrors {
        const errors: LoginErrors = {};

        if (login.email.trim() === "") errors.email = "Informe o seu e-mail";
        else if (!EMAIL_PATTERN.test(login.email)) errors.email = "E-mail inválido";

        if (login.password === "") errors.password = "Informe a sua senha";

        return errors;
    }

    function validateRegister(): RegisterErrors {
        const errors: RegisterErrors = {};

        if (register.email.trim() === "") errors.email = "Informe o seu e-mail";
        else if (!EMAIL_PATTERN.test(register.email)) errors.email = "E-mail inválido";

        if (register.password === "") errors.password = "Crie uma senha";
        else if (register.password.length < 8)
            errors.password = "A senha precisa ter ao menos 8 caracteres";

        if (register.birthdate === "") errors.birthdate = "Informe a sua data de nascimento";
        else if (new Date(register.birthdate) > new Date())
            errors.birthdate = "A data não pode ser no futuro";

        return errors;
    }

    // --- submits -----------------------------------------------------------
    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        const errors = validateLogin();
        setLoginErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setLoading(true);

        try {
            const response = await auth(login.email, login.password);

            // 202: a senha está certa, mas a conta tem verificação em duas
            // etapas — o cookie de sessão só vem depois do código
            if (response?.two_factor_required) {
                setChallenge(response.challenge);
                setEmailHint(response.email_hint ?? login.email);
                setCode("");
                setCodeError(undefined);
                setMode("two-factor");

                showToast({
                    title: "Verificação em duas etapas",
                    message: response.message,
                    status: "success",
                });
                return;
            }

            showToast({
                title: "Login",
                message: "Login realizado com sucesso! Redirecionando...",
                status: "success",
            });
            router.push("/social-media");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            showToast({
                title: "Login",
                message:
                    err?.response?.data?.message ??
                    "Não foi possível entrar. Tente novamente.",
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    }

    /** Segundo passo do login: o código troca o desafio pelo cookie de sessão. */
    async function handleTwoFactor(e: React.FormEvent) {
        e.preventDefault();

        if (code.length < CODE_LENGTH) {
            setCodeError(`Digite os ${CODE_LENGTH} dígitos do código`);
            return;
        }

        setLoading(true);
        setCodeError(undefined);

        try {
            await api.post("/user/two-factor/verify", { challenge, code });

            showToast({
                title: "Login",
                message: "Login realizado com sucesso! Redirecionando...",
                status: "success",
            });
            router.push("/social-media");
        } catch (err) {
            // desafio morto (expirado ou tentativas esgotadas): o código novo
            // exige recomeçar pela senha
            if (isExpiredChallenge(err)) {
                switchMode("login");
            } else {
                setCodeError(fieldErrors<"code">(err).code ?? "Código inválido");
            }

            showToast({
                title: "Verificação em duas etapas",
                message: errorMessage(err, "Não foi possível confirmar o código."),
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    }

    async function resendCode() {
        setLoading(true);
        setCodeError(undefined);

        try {
            const { data } = await api.post("/user/two-factor/resend", { challenge });

            // o desafio anterior foi invalidado no envio: seguir com o token
            // antigo daria "código expirado" no acerto
            setChallenge(data.challenge);
            setCode("");

            showToast({
                title: "Verificação em duas etapas",
                message: data.message,
                status: "success",
            });
        } catch (err) {
            if (isExpiredChallenge(err)) switchMode("login");

            showToast({
                title: "Verificação em duas etapas",
                message: errorMessage(err, "Não foi possível reenviar o código."),
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();

        const errors = validateRegister();
        setRegisterErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", nameFromEmail(register.email));
            formData.append("email", register.email);
            formData.append("password", register.password);
            formData.append("birthdate", register.birthdate);

            const response = await postFormData("/user/register", formData);

            if (response?.errors) {
                // mapeia os erros de validação da API para os campos
                const apiErrors: RegisterErrors = {};
                Object.entries(response.errors).forEach(([field, messages]) => {
                    apiErrors[field as keyof RegisterErrors] = Array.isArray(messages)
                        ? String(messages[0])
                        : String(messages);
                });
                setRegisterErrors(apiErrors);
                showToast({
                    title: "Cadastro",
                    message: "Revise os campos destacados.",
                    status: "error",
                });
                return;
            }

            showToast({
                title: "Cadastro",
                message: "Conta criada! Faça login para continuar.",
                status: "success",
            });

            // leva para o login já com o e-mail preenchido
            setLogin({ email: register.email, password: "" });
            setRegister({ email: "", password: "", birthdate: "" });
            setMode("login");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            showToast({
                title: "Cadastro",
                message:
                    err?.response?.data?.message ??
                    "Não foi possível criar a conta. Tente novamente.",
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleForgot(e: React.FormEvent) {
        e.preventDefault();

        const errors: ForgotErrors = {};
        if (forgotEmail.trim() === "") errors.email = "Informe o seu e-mail";
        else if (!EMAIL_PATTERN.test(forgotEmail)) errors.email = "E-mail inválido";

        setForgotErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setLoading(true);

        // post() devolve undefined quando a requisição falha
        const response = await post("/user/forgot-password", { email: forgotEmail });

        setLoading(false);

        if (!response) {
            showToast({
                title: "Recuperar senha",
                message: "Não foi possível enviar as instruções. Tente novamente.",
                status: "error",
            });
            return;
        }

        showToast({
            title: "Recuperar senha",
            message: "Se o e-mail estiver cadastrado, enviamos as instruções para ele.",
            status: "success",
        });
        setForgotEmail("");
    }

    const tabClass = (active: boolean) =>
        `flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors cursor-pointer
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
        ${active ? "bg-brand text-on-brand" : "text-neutral-300 hover:text-white"}`;

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-neutral-950">

            <div className="flex w-full lg:w-[420px] xl:w-[480px] shrink-0 flex-col items-center
                justify-center bg-neutral-950 px-6 py-10 text-white">

                <div className="w-full max-w-sm">
                    <HeaderLogin />

                    {/* Abas: uma única tela para entrar e criar conta.
                        A recuperação de senha é um estado desta mesma tela. */}
                    <div
                        role="tablist"
                        aria-label="Autenticação"
                        className="flex gap-1 rounded-full bg-neutral-900 p-1 mb-6"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={mode !== "register"}
                            aria-controls="painel-auth"
                            onClick={() => switchMode("login")}
                            className={tabClass(mode !== "register")}
                        >
                            Entrar
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={mode === "register"}
                            aria-controls="painel-auth"
                            onClick={() => switchMode("register")}
                            className={tabClass(mode === "register")}
                        >
                            Criar conta
                        </button>
                    </div>

                    <div id="painel-auth" role="tabpanel">
                        {mode === "login" && (
                            <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4">
                                <h1 className="text-lg font-semibold">Seja bem vindo</h1>

                                <Input
                                    label="E-mail"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    placeholder="Digite o seu e-mail"
                                    value={login.email}
                                    error={loginErrors.email}
                                    onChange={(e) => {
                                        setLogin({ ...login, email: e.target.value });
                                        setLoginErrors({ ...loginErrors, email: undefined });
                                    }}
                                />

                                <Input
                                    label="Senha"
                                    type="password"
                                    name="password"
                                    autoComplete="current-password"
                                    placeholder="Digite a sua senha"
                                    value={login.password}
                                    error={loginErrors.password}
                                    onChange={(e) => {
                                        setLogin({ ...login, password: e.target.value });
                                        setLoginErrors({ ...loginErrors, password: undefined });
                                    }}
                                />

                                <FormButtom label="Entrar" type="submit" loading={loading} className="w-full" />

                                {/* Troca de modo na mesma tela — sem navegação */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setForgotEmail(login.email);
                                        switchMode("forgot");
                                    }}
                                    className="self-start text-xs text-brand font-semibold cursor-pointer
                                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                >
                                    Esqueceu sua senha?
                                </button>
                            </form>
                        )}

                        {mode === "two-factor" && (
                            <form onSubmit={handleTwoFactor} noValidate className="flex flex-col gap-4">
                                <div>
                                    <h1 className="text-lg font-semibold">Confirme que é você</h1>
                                    <p className="text-xs text-neutral-400 mt-1">
                                        Enviamos um código de {CODE_LENGTH} dígitos para{" "}
                                        <strong className="text-white">{emailHint}</strong>. Ele vale
                                        por 10 minutos.
                                    </p>
                                </div>

                                <CodeInput
                                    label="Código de verificação"
                                    value={code}
                                    onChange={(value) => {
                                        setCode(value);
                                        setCodeError(undefined);
                                    }}
                                    error={codeError}
                                    disabled={loading}
                                    autoFocus
                                />

                                <FormButtom
                                    label="Entrar"
                                    type="submit"
                                    loading={loading}
                                    className="w-full"
                                />

                                <div className="flex flex-row flex-wrap items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={resendCode}
                                        disabled={loading}
                                        className="text-xs text-brand font-semibold cursor-pointer
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                    >
                                        Reenviar código
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => switchMode("login")}
                                        className="text-xs text-neutral-400 font-semibold cursor-pointer
                                            hover:text-white
                                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                    >
                                        Usar outra conta
                                    </button>
                                </div>
                            </form>
                        )}

                        {mode === "forgot" && (
                            <form onSubmit={handleForgot} noValidate className="flex flex-col gap-4">
                                <div>
                                    <h1 className="text-lg font-semibold">Recuperar senha</h1>
                                    <p className="text-xs text-neutral-400 mt-1">
                                        Informe o e-mail da sua conta e enviaremos o link para
                                        criar uma nova senha.
                                    </p>
                                </div>

                                <Input
                                    label="E-mail"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    placeholder="Digite o seu e-mail"
                                    value={forgotEmail}
                                    error={forgotErrors.email}
                                    onChange={(e) => {
                                        setForgotEmail(e.target.value);
                                        setForgotErrors({});
                                    }}
                                />

                                <FormButtom
                                    label="Enviar instruções"
                                    type="submit"
                                    loading={loading}
                                    className="w-full"
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        setLogin({ ...login, email: forgotEmail || login.email });
                                        switchMode("login");
                                    }}
                                    className="self-start text-xs text-brand font-semibold cursor-pointer
                                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                >
                                    Voltar para o login
                                </button>
                            </form>
                        )}

                        {mode === "register" && (
                            <form onSubmit={handleRegister} noValidate className="flex flex-col gap-4">
                                <h1 className="text-lg font-semibold">Criar sua conta</h1>

                                <Input
                                    label="E-mail"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    placeholder="Digite o seu e-mail"
                                    value={register.email}
                                    error={registerErrors.email}
                                    onChange={(e) => {
                                        setRegister({ ...register, email: e.target.value });
                                        setRegisterErrors({ ...registerErrors, email: undefined });
                                    }}
                                />

                                <Input
                                    label="Senha"
                                    type="password"
                                    name="password"
                                    autoComplete="new-password"
                                    placeholder="Mínimo de 8 caracteres"
                                    value={register.password}
                                    error={registerErrors.password}
                                    onChange={(e) => {
                                        setRegister({ ...register, password: e.target.value });
                                        setRegisterErrors({ ...registerErrors, password: undefined });
                                    }}
                                />

                                <Input
                                    label="Data de nascimento"
                                    type="date"
                                    name="birthdate"
                                    autoComplete="bday"
                                    value={register.birthdate}
                                    error={registerErrors.birthdate}
                                    onChange={(e) => {
                                        setRegister({ ...register, birthdate: e.target.value });
                                        setRegisterErrors({ ...registerErrors, birthdate: undefined });
                                    }}
                                />

                                <FormButtom
                                    label="Criar conta"
                                    type="submit"
                                    loading={loading}
                                    className="w-full"
                                />

                                {/* Consentimento vira aviso no lugar de checkbox, para
                                    não somar um campo a mais ao cadastro */}
                                <p className="text-xs text-neutral-400">
                                    Ao criar a conta você aceita os{" "}
                                    <a href="#" className="text-brand font-semibold">
                                        Termos e condições
                                    </a>
                                    .
                                </p>

                                <p className="text-xs text-neutral-400">
                                    Seu nome de exibição e sua foto começam em branco e podem ser
                                    definidos depois no seu perfil.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <div className="hidden lg:block relative flex-1">
                <Image
                    src="/imgs/img_login.jpg"
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 0px, 70vw"
                    priority
                />
            </div>

        </div>
    );
}
