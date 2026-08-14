'use client';

import { useEffect, useState } from "react";
import Input from "../input";
import Button from "../button";
import FormButtom from "../form-buttom";
import Skeleton from "../skeleton";
import SettingsSection from "./settings-section";
import CodeInput, { CODE_LENGTH } from "../code-input";
import ShieldCheckIcon from "../icons/shield-check";
import api from "@/api/services/request";
import { errorMessage, fieldErrors, isExpiredChallenge } from "../../utils/api-error";
import { useToaster } from "../../providers/toaster-provider";

type Status = {
    enabled: boolean;
    email: string;
};

/**
 * Em que ponto do fluxo a seção está:
 * - `idle`: só o estado atual e o botão de ligar/desligar
 * - `code`: código enviado, esperando a confirmação para ativar
 * - `password`: esperando a senha para desativar
 */
type Step = "idle" | "code" | "password";

/**
 * Verificação em duas etapas por e-mail.
 *
 * Ativar é em dois passos de propósito: o código confirma que a caixa de
 * entrada cadastrada é mesmo acessível, senão o recurso trancaria a conta na
 * primeira saída. Desativar pede a senha, não o código, para não depender do
 * e-mail justamente quando ele é o problema.
 */
export default function TwoFactorSection() {
    const { showToast } = useToaster();

    const [status, setStatus] = useState<Status | null>(null);
    const [step, setStep] = useState<Step>("idle");
    const [loading, setLoading] = useState(false);

    const [challenge, setChallenge] = useState("");
    const [code, setCode] = useState("");
    const [codeError, setCodeError] = useState<string | undefined>();

    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | undefined>();

    useEffect(() => {
        loadStatus();
    }, []);

    async function loadStatus() {
        try {
            const { data } = await api.get("/social-media/user/two-factor");
            setStatus({ enabled: data.enabled, email: data.email });
        } catch {
            showToast({
                title: "Verificação em duas etapas",
                message: "Não foi possível carregar a configuração.",
                status: "error",
            });
        }
    }

    function backToIdle() {
        setStep("idle");
        setChallenge("");
        setCode("");
        setCodeError(undefined);
        setPassword("");
        setPasswordError(undefined);
    }

    /** Passo 1 da ativação — também é o reenvio, que aposenta o código anterior. */
    async function sendCode(resending = false) {
        setLoading(true);
        setCodeError(undefined);

        try {
            const { data } = await api.post("/social-media/user/two-factor/code");

            setChallenge(data.challenge);
            setCode("");
            setStep("code");

            showToast({
                title: "Verificação em duas etapas",
                message: resending ? "Enviamos um código novo." : data.message,
                status: "success",
            });
        } catch (error) {
            showToast({
                title: "Verificação em duas etapas",
                message: errorMessage(error, "Não foi possível enviar o código."),
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    }

    /** Passo 2 da ativação. */
    async function confirmCode(e: React.FormEvent) {
        e.preventDefault();

        if (code.length < CODE_LENGTH) {
            setCodeError(`Digite os ${CODE_LENGTH} dígitos do código`);
            return;
        }

        setLoading(true);
        setCodeError(undefined);

        try {
            await api.post("/social-media/user/two-factor", { challenge, code });

            setStatus((current) => (current ? { ...current, enabled: true } : current));
            backToIdle();

            showToast({
                title: "Verificação em duas etapas",
                message: "Ativada! A partir de agora o login vai pedir um código.",
                status: "success",
            });
        } catch (error) {
            // desafio morto (expirou ou estourou as tentativas): não adianta
            // insistir no mesmo código, a tela volta para o começo
            if (isExpiredChallenge(error)) {
                backToIdle();
            } else {
                setCodeError(fieldErrors<"code">(error).code ?? "Código inválido");
            }

            showToast({
                title: "Verificação em duas etapas",
                message: errorMessage(error, "Não foi possível confirmar o código."),
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    }

    async function disable(e: React.FormEvent) {
        e.preventDefault();

        if (password === "") {
            setPasswordError("Informe a sua senha");
            return;
        }

        setLoading(true);
        setPasswordError(undefined);

        try {
            // DELETE com corpo: no axios ele vai em `data`
            await api.delete("/social-media/user/two-factor", { data: { password } });

            setStatus((current) => (current ? { ...current, enabled: false } : current));
            backToIdle();

            showToast({
                title: "Verificação em duas etapas",
                message: "Desativada. O login voltou a pedir só a senha.",
                status: "success",
            });
        } catch (error) {
            setPasswordError(fieldErrors<"password">(error).password);

            showToast({
                title: "Verificação em duas etapas",
                message: errorMessage(error, "Não foi possível desativar."),
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    }

    const enabled = status?.enabled ?? false;

    return (
        <SettingsSection
            icon={ShieldCheckIcon}
            title="Verificação em duas etapas"
            description="Além da senha, o acesso passa a exigir um código enviado para o seu e-mail."
            badge={
                status && (
                    <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${enabled
                            ? "bg-brand-subtle text-brand"
                            : "bg-surface-3 text-content-muted"}`}
                    >
                        {enabled ? "Ativa" : "Desativada"}
                    </span>
                )
            }
        >
            {!status && <Skeleton height="h-10" width="w-48" rounded="field" />}

            {status && step === "idle" && (
                <div className="flex flex-col gap-3 sm:max-w-md">
                    <p className="text-sm text-content-muted">
                        {enabled
                            ? `Os códigos são enviados para ${status.email}.`
                            : "Recomendado: sem o seu e-mail, ninguém entra só com a senha."}
                    </p>

                    {enabled ? (
                        <Button
                            variant="danger"
                            size="md"
                            className="self-start rounded-field font-semibold"
                            onClick={() => setStep("password")}
                        >
                            Desativar
                        </Button>
                    ) : (
                        <FormButtom
                            type="button"
                            label="Ativar"
                            loading={loading}
                            onClick={() => sendCode()}
                            className="self-start"
                        />
                    )}
                </div>
            )}

            {status && step === "code" && (
                <form onSubmit={confirmCode} className="flex flex-col gap-4 sm:max-w-md">
                    <p className="text-sm text-content-muted">
                        Enviamos um código de {CODE_LENGTH} dígitos para{" "}
                        <strong className="text-content">{status.email}</strong>.
                    </p>

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

                    <div className="flex flex-row flex-wrap items-center gap-2">
                        <FormButtom type="submit" label="Confirmar e ativar" loading={loading} />

                        <Button size="md" onClick={() => sendCode(true)} disabled={loading}>
                            Reenviar código
                        </Button>

                        <Button
                            variant="ghost"
                            size="md"
                            onClick={backToIdle}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            )}

            {status && step === "password" && (
                <form onSubmit={disable} className="flex flex-col gap-4 sm:max-w-md">
                    <p className="text-sm text-content-muted">
                        Confirme a sua senha para desligar a verificação em duas etapas.
                    </p>

                    <Input
                        type="password"
                        label="Senha"
                        autoComplete="current-password"
                        value={password}
                        error={passwordError}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError(undefined);
                        }}
                    />

                    <div className="flex flex-row flex-wrap items-center gap-2">
                        <Button
                            type="submit"
                            variant="danger"
                            size="md"
                            className="rounded-field font-semibold"
                            disabled={loading}
                        >
                            Desativar
                        </Button>

                        <Button
                            variant="ghost"
                            size="md"
                            onClick={backToIdle}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            )}
        </SettingsSection>
    );
}
