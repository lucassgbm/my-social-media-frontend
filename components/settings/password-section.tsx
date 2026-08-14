'use client';

import { useState } from "react";
import Input from "../input";
import FormButtom from "../form-buttom";
import SettingsSection from "./settings-section";
import LockClosedIcon from "../icons/lock-closed";
import api from "@/api/services/request";
import { errorMessage, fieldErrors } from "../../utils/api-error";
import { useToaster } from "../../providers/toaster-provider";

type PasswordForm = {
    current_password: string;
    password: string;
    password_confirmation: string;
};

type PasswordErrors = Partial<Record<keyof PasswordForm, string>>;

const EMPTY_FORM: PasswordForm = {
    current_password: "",
    password: "",
    password_confirmation: "",
};

/** Mesmo mínimo do `Password::min(8)` do PasswordController. */
const MIN_LENGTH = 8;

/**
 * Troca de senha.
 *
 * A validação local só evita o ida e volta óbvio (campo vazio, senha curta,
 * confirmação diferente); quem decide de verdade é o backend, que também
 * confere a senha atual e derruba as outras sessões.
 */
export default function PasswordSection() {
    const { showToast } = useToaster();

    const [form, setForm] = useState<PasswordForm>(EMPTY_FORM);
    const [errors, setErrors] = useState<PasswordErrors>({});
    const [loading, setLoading] = useState(false);

    function setField(field: keyof PasswordForm, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    }

    function validate(): PasswordErrors {
        const found: PasswordErrors = {};

        if (form.current_password === "") found.current_password = "Informe a sua senha atual";

        if (form.password === "") found.password = "Crie uma senha";
        else if (form.password.length < MIN_LENGTH)
            found.password = `A senha precisa ter ao menos ${MIN_LENGTH} caracteres`;
        else if (form.password === form.current_password)
            found.password = "A nova senha precisa ser diferente da atual";

        if (form.password_confirmation !== form.password)
            found.password_confirmation = "A confirmação não confere";

        return found;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const found = validate();
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setLoading(true);

        try {
            await api.put("/social-media/user/password", form);

            // limpa tudo: os campos guardam a senha em texto na memória do form
            setForm(EMPTY_FORM);

            showToast({
                title: "Senha",
                message: "Senha alterada. As outras sessões foram desconectadas.",
                status: "success",
            });
        } catch (error) {
            setErrors(fieldErrors<keyof PasswordForm>(error));

            showToast({
                title: "Senha",
                message: errorMessage(error, "Não foi possível alterar a senha."),
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <SettingsSection
            icon={LockClosedIcon}
            title="Senha"
            description="Ao trocar a senha, as sessões abertas em outros dispositivos são encerradas."
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:max-w-md">
                <Input
                    type="password"
                    label="Senha atual"
                    autoComplete="current-password"
                    value={form.current_password}
                    error={errors.current_password}
                    onChange={(e) => setField("current_password", e.target.value)}
                />

                <Input
                    type="password"
                    label="Nova senha"
                    autoComplete="new-password"
                    value={form.password}
                    error={errors.password}
                    onChange={(e) => setField("password", e.target.value)}
                />

                <Input
                    type="password"
                    label="Confirmar nova senha"
                    autoComplete="new-password"
                    value={form.password_confirmation}
                    error={errors.password_confirmation}
                    onChange={(e) => setField("password_confirmation", e.target.value)}
                />

                <FormButtom
                    type="submit"
                    label="Alterar senha"
                    loading={loading}
                    className="self-start"
                />
            </form>
        </SettingsSection>
    );
}
