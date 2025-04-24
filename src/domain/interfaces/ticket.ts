export interface Ticket {
  id: string;
  number: number;
  createdAt: Date;
  handleAtModule?: string | null;
  HandleAt?: Date;
  done: boolean;
}

export interface Ticket_ {
  id: number;
  code: string;
  priority: boolean;
  ticketType: string;
  serviceData: Date | null;
  moduleId: number | null;
  headquarterId: number;
  userId: number;
}
