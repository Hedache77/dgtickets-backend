import { UuidAdapter } from "../../config";
import { prisma } from "../../data/postgres";
import {
  CreateTicketDto,
  CustomError,
  GetTicketByIdDto,
  PaginationDto,
  UpdateTicketDto,
} from "../../domain";

export class TicketService_ {
  constructor() {}

  async createTicket(createTicketDto: CreateTicketDto) {
    try {
      function toBoolean(value: string): boolean {
        return value.toLowerCase() === 'true';
      }

      let valIsActive = toBoolean(createTicketDto.priority.toString());

      const ticket = await prisma.ticket.create({
        data: {
          code: UuidAdapter.v4(),
          priority: valIsActive,
          headquarterId: +createTicketDto.headquarterId,
          userId: +createTicketDto.userId,
        },
      });

      return {
        ticket,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async updateTicket(updateTicketDto: UpdateTicketDto) {
    const ticketFind = await prisma.ticket.findFirst({
      where: { code: updateTicketDto.code },
    });

    if (!ticketFind) throw CustomError.badRequest("Ticket not exist");

    try {
      function toBoolean(value: string): boolean {
        return value.toLowerCase() === 'true';
      }

      let valPriority = toBoolean(updateTicketDto.priority.toString());

      const ticket = await prisma.ticket.update({
        where: { id: ticketFind.id },

        data: {
          priority:
            ticketFind.priority != valPriority
              ? valPriority
              : ticketFind.priority,
          ticketType:
            ticketFind.ticketType != updateTicketDto.ticketType
              ? updateTicketDto.ticketType
              : ticketFind.ticketType,
          serviceData:
            ticketFind.serviceData != updateTicketDto.serviceData
              ? updateTicketDto.serviceData
              : ticketFind.serviceData,
          moduleId:
            ticketFind.moduleId != updateTicketDto.moduleId
              ? +updateTicketDto.moduleId
              : +ticketFind.moduleId,
        },
      });

      return {
        ticket,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getTickets(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    try {
      const [total, tickets] = await Promise.all([
        prisma.ticket.count(),
        prisma.ticket.findMany({
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        page: page,
        limit: limit,
        total: total,
        next:
          page < totalPages
            ? `/api/tickets?page=${page + 1}&limit=${limit}`
            : null,
        prev:
          page - 1 > 0 ? `/api/tickets?page=${page - 1}&limit=${limit}` : null,
        tickets,
      };
    } catch (error) {
      throw CustomError.internalServer("Internal Server Error");
    }
  }

  async getTicketById(getTicketByIdDto: GetTicketByIdDto) {
    const { code } = getTicketByIdDto;

    if (!code) throw CustomError.badRequest("code property is required");

    try {
      const ticket = await prisma.ticket.findFirst({ where: { code } });

      if (!ticket) throw CustomError.notFound("ticket not found");

      return {
        ticket,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
