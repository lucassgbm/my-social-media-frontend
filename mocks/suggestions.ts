/**
 * Dados de demonstração usados enquanto os endpoints reais não existem.
 * Mantidos fora das páginas para que a troca por dados da API seja um
 * único ponto de mudança.
 */

export type SuggestedUser = {
  id: number;
  name: string;
  title: string;
  photo_path: string;
  location?: string;
};

export type SuggestedCommunity = {
  id: number;
  name: string;
  description: string;
  photo_path: string;
  location?: string;
};

export type SuggestedEvent = {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  image: string;
};

export const suggestedFriends: SuggestedUser[] = [
  {
    id: 1,
    name: "João",
    title: "Estudante",
    photo_path:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
  },
  {
    id: 2,
    name: "Maria",
    title: "Maquiadora",
    photo_path:
      "https://images.unsplash.com/photo-1769097137026-c482044ca0fb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDE5fHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D",
  },
  {
    id: 3,
    name: "Pedro",
    title: "Desenvolvedor Full Stack",
    photo_path:
      "https://images.unsplash.com/photo-1770191954591-952ab5c63e68?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDkyfHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D",
  },
  {
    id: 4,
    name: "Ana",
    title: "Dentista",
    photo_path:
      "https://images.unsplash.com/photo-1770576568718-6747e3d85de8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDMzfHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D",
  },
  {
    id: 5,
    name: "Pedro",
    title: "Empresário",
    photo_path:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
  },
  {
    id: 6,
    name: "Maria",
    title: "Dentista",
    photo_path:
      "https://images.unsplash.com/photo-1770576568718-6747e3d85de8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDMzfHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D",
  },
  {
    id: 7,
    name: "Maria",
    title: "Advogada",
    photo_path:
      "https://images.unsplash.com/photo-1769097137026-c482044ca0fb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDE5fHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D",
  },
];

export const suggestedCommunities: SuggestedCommunity[] = [
  {
    id: 1,
    name: "Clube dos Clássicos",
    description: "Encontros mensais de carros antigos",
    location: "Rio de Janeiro - RJ",
    photo_path:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2Fycm9zfGVufDB8fDB8fHww",
  },
  {
    id: 2,
    name: "Estrada & Família",
    description: "Roteiros de viagem para fazer com as crianças",
    location: "São Paulo - SP",
    photo_path:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y2Fyc3xlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    id: 3,
    name: "Garagem DF",
    description: "Mecânica, dicas e mutirões de manutenção",
    location: "Brasília - DF",
    photo_path:
      "https://images.unsplash.com/photo-1567818668259-e66acac21610?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODJ8fGNhcnJvc3xlbnwwfHwwfHx8MA%3D%3D",
  },
];

export type CommunityTopic = {
  id: number;
  title: string;
  replies: number;
  image: string;
};

export const communityTopics: CommunityTopic[] = [
  { id: 1, title: "Qual pneu vocês usam no treino?", replies: 12, image: "/imgs/drift.jpg" },
  { id: 2, title: "Encontro de sábado — confirmados", replies: 34, image: "/imgs/drift.jpg" },
  { id: 3, title: "Dicas para quem está começando", replies: 8, image: "/imgs/drift.jpg" },
  { id: 4, title: "Peças usadas: compra e venda", replies: 51, image: "/imgs/drift.jpg" },
];

export const communityGallery: { id: number; image: string }[] = [
  { id: 1, image: "/imgs/drift.jpg" },
  { id: 2, image: "/imgs/drift.jpg" },
  { id: 3, image: "/imgs/drift.jpg" },
  { id: 4, image: "/imgs/drift.jpg" },
  { id: 5, image: "/imgs/drift.jpg" },
  { id: 6, image: "/imgs/drift.jpg" },
];

export const suggestedEvents: SuggestedEvent[] = [
  {
    id: 1,
    title: "Megadrift",
    description: "Descrição do evento 1",
    location: "Local do evento 1",
    date: "01/10/2026",
    time: "10:00",
    image:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y2Fyc3xlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    id: 2,
    title: "Evento 2",
    description: "Descrição do evento 2",
    location: "Local do evento 2",
    date: "01/10/2026",
    time: "10:00",
    image:
      "https://plus.unsplash.com/premium_photo-1664304752635-3e0d8d8185e3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2Fyc3xlbnwwfHwwfHx8MA%3D%3D",
  },
];
