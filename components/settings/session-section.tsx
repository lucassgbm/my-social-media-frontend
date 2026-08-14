'use client';

import SettingsSection from "./settings-section";
import LogoutButton from "../logout-button";
import ArrowRightIcon from "../icons/arrow-right";

/**
 * Encerrar a sessão a partir das preferências.
 *
 * O mesmo botão do menu da conta, com o rótulo por extenso — aqui não há o
 * contexto do menu para explicar o que "Sair" faz.
 */
export default function SessionSection() {
    return (
        <SettingsSection
            icon={ArrowRightIcon}
            title="Sessão"
            description="Encerra o acesso neste dispositivo. As sessões abertas em outros continuam ativas — para derrubá-las, troque a senha."
        >
            <LogoutButton variant="button" />
        </SettingsSection>
    );
}
