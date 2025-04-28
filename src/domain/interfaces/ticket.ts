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

export interface TicketPositionInfo {
  ticket: {
    id: number;
    ticketType: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED' | 'EXPIRED';
    priority: boolean;
    pendingTimeInSeconds: number | null;
    processingTimeInSeconds: number | null;
    headquarterId: number;
    userId: number;
    moduleId: number | null;
    createdAt: string;
    updatedAt: string;
  };
  position: number;
  timeToAttend: number;
}
