import { UuidAdapter } from "../../config/uuid.adapter";
import { Ticket } from "../../domain/interfaces/ticket";
import { prisma } from "../../data/postgres";
import { WssService } from "./wss.service";

export class TicketService {
  constructor(private readonly wssService = WssService.instance) {}

  private onTicketNumberChanged = async () => {
    const pendingTickets = await this.getPendingTickets();
    const lastTicket = await this.getLastTicketNumber();
    const lastWorkingOnTicket = await this.getLastWorkingOnTickets();
    this.wssService.sendMessagge("on-last-ticket-number-changed", lastTicket);
    this.wssService.sendMessagge("on-ticket-count-changed", pendingTickets);
    this.wssService.sendMessagge(
      "on-working-on-ticket-changed",
      lastWorkingOnTicket
    );
  };

  public getTickets = async () => {
    const tickets = prisma.ticketDemo.findMany();
    return tickets;
  };

  public getPendingTickets = async () => {
    const pendingTickets = prisma.ticketDemo.findMany({
      where: {
        handleAtModule: null,
        done: false,
      },
    });
    return pendingTickets;
  };

  public getLastWorkingOnTickets = async (): Promise<Ticket[]> => {
    const lastWorkingOnTicket = prisma.ticketDemo.findMany({
      where: {
        handleAtModule: { not: null },
      },
      orderBy: { createdAt: "desc" },
    });

    return lastWorkingOnTicket;
  };

  public getLastTicketNumber = async (): Promise<number> => {
    const lastTicket = await prisma.ticketDemo.findFirst({
      orderBy: { createdAt: "desc" },
    });
    return lastTicket ? lastTicket.number : 0;
  };

  public createTicket = async () => {
    const lastTicketNumber = await this.getLastTicketNumber();
    const newTicket = await prisma.ticketDemo.create({
      data: {
        id: UuidAdapter.v4(),
        number: lastTicketNumber + 1,
        done: false,
      },
    });

    await this.onTicketNumberChanged();

    return newTicket;
  };

  public drawTicket = async (module: string) => {
    const ticket = await prisma.ticketDemo.findFirst({
      where: { handleAtModule: null },
      orderBy: { createdAt: "asc" },
    });

    if (!ticket) {
      return { status: "error", message: "No tickets available" };
    }

    const updatedTicket = await prisma.ticketDemo.update({
      where: { id: ticket.id },
      data: {
        handleAtModule: module,
        handleAt: new Date(),
      },
    });

    await this.onTicketNumberChanged();

    return { status: "success", ticket: updatedTicket };
  };

  public onFinishedTicket = async (ticketId: string) => {
    const ticket = await prisma.ticketDemo.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return { status: "error", message: "Ticket not found" };
    }

    const updatedTicket = await prisma.ticketDemo.update({
      where: { id: ticketId },
      data: { done: true },
    });

    return { status: "success", ticket: updatedTicket };
  };
}
