import type { ComponentType } from "react";
import HomeIcon from "./icons/home";
import UsersIcon from "./icons/users";
import CommunityIcon from "./icons/community";
import TrophyIcon from "./icons/trophy";
import MessageIcon from "./icons/message";
import SettingsIcon from "./icons/settings";
import BookMarkIcon from "./icons/book-mark";
import ProfileIcon from "./icons/profile";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  /** Contador exibido como badge (ex.: mensagens não lidas). */
  badge?: number;
};

/**
 * Fonte única de verdade da navegação.
 * Usada por Sidebar (desktop), BottomMenu (mobile) e menu mobile do Header —
 * antes cada uma tinha sua própria lista, com hrefs divergentes.
 */
export const primaryNavItems: NavItem[] = [
  { label: "Início", href: "/social-media", icon: HomeIcon },
  { label: "Amigos", href: "/social-media/friends", icon: UsersIcon },
  { label: "Comunidades", href: "/social-media/communities", icon: CommunityIcon },
  { label: "Eventos", href: "/social-media/events", icon: TrophyIcon },
  { label: "Mensagens", href: "/social-media/messages", icon: MessageIcon, badge: 3 },
];

export const secondaryNavItems: NavItem[] = [
  { label: "Salvos", href: "/social-media/items-saved", icon: BookMarkIcon },
  { label: "Preferências", href: "/social-media/settings", icon: SettingsIcon },
];

/**
 * Sair não entra aqui: esta lista é de navegação, e encerrar a sessão é uma
 * ação — precisa chamar a API antes de sair da tela. Quem renderiza estes
 * itens acrescenta o <LogoutButton /> logo abaixo.
 */
export const accountNavItems: NavItem[] = [
  { label: "Meu perfil", href: "/social-media/profile", icon: ProfileIcon },
  { label: "Preferências", href: "/social-media/settings", icon: SettingsIcon },
];

/**
 * Um item está ativo quando a rota atual é ele ou uma sub-rota dele.
 * A home ("/social-media") só casa exatamente, senão ficaria sempre ativa.
 */
export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/social-media") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
