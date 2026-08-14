'use client';

import Container from "../../../../../components/container";
import Sidebar from "../../../../../components/sidebar";
import PageHeader from "../../../../../components/page-header";
import SettingsIcon from "../../../../../components/icons/settings";
import PasswordSection from "../../../../../components/settings/password-section";
import TwoFactorSection from "../../../../../components/settings/two-factor-section";
import BlockedUsersSection from "../../../../../components/settings/blocked-users-section";
import AppearanceSection from "../../../../../components/settings/appearance-section";
import SessionSection from "../../../../../components/settings/session-section";

/**
 * Preferências da conta (/social-media/settings).
 *
 * O item já existia na navegação (nav-items) apontando para uma rota que não
 * existia. As seções são independentes e carregam os próprios dados — uma
 * falha no 2FA não deixa a lista de bloqueados sem aparecer.
 *
 * Empilhadas em coluna única, e não em abas: são poucas, e as de segurança
 * (senha e duas etapas) fazem sentido lidas juntas.
 */
export default function SettingsPage() {
    return (
        <>
            <Sidebar />

            <div className="flex flex-1 min-w-0 flex-col">
                <Container className="w-full rounded-card min-w-0" padding="p-0">
                    <PageHeader
                        icon={SettingsIcon}
                        title="Preferências"
                        subtitle="Segurança da conta, privacidade e aparência."
                    />

                    <div className="flex flex-col gap-4 p-4 sm:p-6">
                        <PasswordSection />
                        <TwoFactorSection />
                        <BlockedUsersSection />
                        <AppearanceSection />
                        <SessionSection />
                    </div>
                </Container>
            </div>
        </>
    );
}
