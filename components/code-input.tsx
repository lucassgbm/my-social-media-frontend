'use client';

import { useId } from "react";

type CodeInputProps = {
    value: string;
    onChange: (value: string) => void;
    label: string;
    error?: string;
    disabled?: boolean;
    /** Foca o campo ao montar — a tela do código nasce esperando a digitação. */
    autoFocus?: boolean;
};

/** Tamanho do código gerado pelo TwoFactorCode do backend. */
export const CODE_LENGTH = 6;

/**
 * Campo do código de verificação em duas etapas.
 *
 * Compartilhado pela ativação (tela de preferências) e pelo segundo passo do
 * login — os dois pedem o mesmo código de seis dígitos.
 *
 * Um input só, em vez de seis caixinhas: colar o código do e-mail funciona sem
 * tratamento especial, e o preenchimento automático do navegador
 * (`one-time-code`) precisa de um campo único para acontecer.
 *
 * Só dígitos entram — o backend também descarta o resto, mas deixar o espaço
 * ou o hífen aparecer na tela confunde quem está conferindo o que digitou.
 */
export default function CodeInput({
    value,
    onChange,
    label,
    error,
    disabled,
    autoFocus,
}: CodeInputProps) {
    const inputId = useId();
    const errorId = `${inputId}-error`;

    return (
        <div className="flex w-full flex-col">
            <label htmlFor={inputId} className="mb-2 text-xs font-semibold">
                {label}
            </label>

            <input
                id={inputId}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus={autoFocus}
                disabled={disabled}
                maxLength={CODE_LENGTH}
                value={value}
                onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))}
                placeholder="000000"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className={`w-full max-w-[14rem] rounded-field border bg-surface p-3 text-center
                    font-mono text-2xl tracking-[0.5em] text-content
                    placeholder:text-content-subtle placeholder:tracking-[0.5em]
                    disabled:opacity-50
                    focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-ring
                    ${error ? "border-danger" : "border-line"}`}
            />

            {error && (
                <span id={errorId} role="alert" className="mt-1 text-xs text-danger">
                    {error}
                </span>
            )}
        </div>
    );
}
