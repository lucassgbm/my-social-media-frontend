/**
 * Dados de demonstração do painel de mensagens e notificações.
 *
 * Não existe endpoint de chat na API ainda (routes/api.php não tem nada de
 * mensagens), então a conversa vive só no estado do componente. Mantido aqui,
 * junto dos outros mocks, para que ligar na API seja um ponto único de troca.
 */

export type ChatMessage = {
    id: number;
    /** true quando a mensagem é do usuário logado. */
    mine: boolean;
    text: string;
    /** HH:MM — string fixa para não depender de fuso na renderização. */
    time: string;
};

export type Conversation = {
    id: number;
    name: string;
    photo_path: string;
    online: boolean;
    /** Quantidade de mensagens não lidas; zera ao abrir a conversa. */
    unread: number;
    /** Simula o "está digitando..." do outro lado. */
    typing?: boolean;
    messages: ChatMessage[];
};

export type NotificationType = "like" | "comment" | "friend" | "community";

export type AppNotification = {
    id: number;
    type: NotificationType;
    actor: string;
    text: string;
    time: string;
    read: boolean;
};

const AVATARS = {
    joao: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
    maria: "https://images.unsplash.com/photo-1769097137026-c482044ca0fb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDE5fHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D",
    pedro: "https://images.unsplash.com/photo-1770191954591-952ab5c63e68?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDkyfHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D",
    ana: "https://images.unsplash.com/photo-1770576568718-6747e3d85de8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDMzfHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D",
};

export const mockConversations: Conversation[] = [
    {
        id: 1,
        name: "João",
        photo_path: AVATARS.joao,
        online: true,
        unread: 3,
        typing: true,
        messages: [
            { id: 1, mine: false, text: "Olá, tudo bem?", time: "09:00" },
            { id: 2, mine: true, text: "Tudo e com você?", time: "09:02" },
            { id: 3, mine: false, text: "Tudo ótimo! Vai no encontro de sábado?", time: "09:03" },
            { id: 4, mine: true, text: "Vou sim, já confirmei presença.", time: "09:05" },
            { id: 5, mine: false, text: "Boa! Combinamos de sair juntos então", time: "09:06" },
        ],
    },
    {
        id: 2,
        name: "Maria",
        photo_path: AVATARS.maria,
        online: true,
        unread: 1,
        messages: [
            { id: 1, mine: false, text: "Viu as fotos que postei?", time: "08:17" },
            { id: 2, mine: true, text: "Ainda não, vou olhar agora", time: "08:20" },
            { id: 3, mine: false, text: "Me conta o que achou 😄", time: "08:21" },
        ],
    },
    {
        id: 3,
        name: "Pedro",
        photo_path: AVATARS.pedro,
        online: false,
        unread: 0,
        messages: [
            { id: 1, mine: true, text: "Fechado pro treino de terça?", time: "Ontem" },
            { id: 2, mine: false, text: "Fechado! Levo o equipamento", time: "Ontem" },
        ],
    },
    {
        id: 4,
        name: "Ana",
        photo_path: AVATARS.ana,
        online: false,
        unread: 0,
        messages: [{ id: 1, mine: false, text: "Obrigada pela indicação!", time: "Seg" }],
    },
];

export const mockNotifications: AppNotification[] = [
    { id: 1, type: "like", actor: "Maria", text: "curtiu a sua foto", time: "há 5 min", read: false },
    { id: 2, type: "comment", actor: "Pedro", text: "comentou no seu post", time: "há 1 h", read: false },
    { id: 3, type: "friend", actor: "Ana", text: "aceitou o seu convite de amizade", time: "há 3 h", read: true },
    { id: 4, type: "community", actor: "Garagem DF", text: "publicou um novo evento", time: "Ontem", read: true },
];
