/**
 * Dados de demonstração usados enquanto os endpoints reais não existem.
 * Mantidos fora das páginas para que a troca por dados da API seja um
 * único ponto de mudança.
 *
 * Pessoas saíram daqui: amigos, sugestões e membros vêm da API
 * (/social-media/friends, /friends/suggestions e /community/{id}).
 */

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
