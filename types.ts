export type EventStatus = 'Pendente' | 'Em Execução' | 'Concluído' | 'Agendado';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: EventStatus;
  progress: number;
  icon: string;
  image: string;
}

export type ItemStatus = 'Pendente' | 'Análise' | 'Revisão' | 'Concluído';

export interface Photo {
  id: string;
  url: string;
  timestamp?: string;
  coords?: string;
  isVerified: boolean;
  hasWarning?: boolean;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredQuantity: number;
  dailyRate: number; // Added dailyRate
  currentQuantity: number;
  status: ItemStatus;
  icon: string;
  photos: Photo[];
  checklist: { label: string; checked: boolean }[];
}

export interface User {
  name: string;
  email: string;
}