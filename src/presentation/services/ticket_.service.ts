import { TicketStatus } from "@prisma/client";
import { getTimeTickets, UuidAdapter } from "../../config";
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
    const headquarterFind = await prisma.headquarter.findFirst({
      where: { id: +createTicketDto.headquarterId },
    });
    if (!headquarterFind) throw CustomError.badRequest("Headquarter not exist");

    const userFind = await prisma.user.findFirst({
      where: { id: +createTicketDto.userId },
    });
    if (!userFind) throw CustomError.badRequest("User not exist");

    try {
      function toBoolean(value: string): boolean {
        return value.toLowerCase() === "true";
      }

      let valIsActive = toBoolean(createTicketDto.priority.toString());

      const ticket = await prisma.ticket.create({
        data: {
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
    const id = updateTicketDto.id;

    if (!id) throw CustomError.badRequest("id property is required");

    if (!id) throw CustomError.badRequest(`${id} is not a number`);

    const ticketFind = await prisma.ticket.findFirst({
      where: { id: +updateTicketDto.id },
    });

    if (!ticketFind) throw CustomError.badRequest("Ticket not exist");

    const moduleExist = await prisma.module.findFirst({
      where: { id: +updateTicketDto.moduleId },
    });

    if (!moduleExist) throw CustomError.badRequest("Module not exist");

    let medicines = updateTicketDto.medicines;

    if (typeof medicines === "string") {
      try {
        medicines = JSON.parse(medicines);
      } catch (error) {
        throw new Error(`${error}`);
      }
    }

    const normalized = Array.isArray(medicines) ? medicines : [medicines];

    const filtered = normalized.filter(
      (m) => m?.medicineId !== undefined && m?.quantity !== undefined
    );

    try {
      const module = await prisma.module.findUnique({
        where: { id: +updateTicketDto.moduleId },
        select: {
          headquarterId: true,
        },
      });

      for (const med of filtered) {
        const medicineStock = await prisma.headquarterToMedicine.findFirst({
          where: {
            headquarterId: +module!,
            medicineId: +med.medicineId,
          },
        });

        if (!medicineStock)
          throw CustomError.badRequest(
            "Medicine not exist or not available in this headquarter"
          );

        if (med.quantity > medicineStock.quantity) {
          throw CustomError.badRequest("Not enough stock available");
        }

        await prisma.headquarterToMedicine.update({
          where: { id: +medicineStock.id },
          data: {
            quantity: medicineStock.quantity - +med.quantity,
          },
        });
      }
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }

    try {
      function toBoolean(value: string): boolean {
        return value.toLowerCase() === "true";
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
          moduleId:
            ticketFind.moduleId != updateTicketDto.moduleId
              ? +updateTicketDto.moduleId
              : +ticketFind.moduleId,
        },
      });

      await prisma.ticketStatusHistory.create({
        data: {
          ticketId: ticket.id,
          oldStatus: ticketFind.ticketType,
          newStatus: updateTicketDto.ticketType,
          userId: +updateTicketDto.userUpdated,
        },
      });

      if (filtered.length) {
        await prisma.ticketMedicine.createMany({
          data: filtered.map((med) => ({
            ticketId: ticket.id,
            medicineId: med.medicineId,
            quantity: med.quantity,
          })),
          skipDuplicates: true,
        });
      }

      if (
        updateTicketDto.ticketType === TicketStatus.IN_PROGRESS &&
        ticketFind.ticketType === TicketStatus.PENDING
      ) {
        await prisma.ticket.update({
          where: { id: ticketFind.id },

          data: {
            pendingTimeInSeconds: getTimeTickets(
              ticket.createdAt,
              ticket.updatedAt!
            ),
          },
        });
      }

      if (
        updateTicketDto.ticketType === TicketStatus.COMPLETED &&
        ticketFind.ticketType === TicketStatus.IN_PROGRESS
      ) {
        await prisma.ticket.update({
          where: { id: ticketFind.id },

          data: {
            processingTimeInSeconds: getTimeTickets(
              ticketFind.updatedAt!,
              ticket.updatedAt!
            ),
          },
        });
      }

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

  async getTicketByRow(getTicketByIdDto: GetTicketByIdDto) {
    const { id } = getTicketByIdDto;

    if (!id) throw CustomError.badRequest("id property is required");

    try {
      const ticketsRows = await prisma.ticket.findMany({
        where: {
          headquarterId: +id,
          ticketType: TicketStatus.PENDING,
          priority: false,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 10,
      });

      const ticketsCountGeneral = await prisma.ticket.findMany({
        where: {
          headquarterId: +id,
          priority: false,
        },
      });

      const validPendingTimes = ticketsCountGeneral.filter(
        (ticket) =>
          ticket.pendingTimeInSeconds !== null &&
          ticket.pendingTimeInSeconds !== undefined
      );
      const validProcessingTimes = ticketsCountGeneral.filter(
        (ticket) =>
          ticket.processingTimeInSeconds !== null &&
          ticket.processingTimeInSeconds !== undefined
      );

      const averagePendingTime =
        validPendingTimes.reduce(
          (sum, ticket) => sum + ticket.pendingTimeInSeconds!,
          0
        ) / validPendingTimes.length || 0;

      const averageProcessingTimeModule =
        validProcessingTimes.reduce(
          (sum, ticket) => sum + ticket.processingTimeInSeconds!,
          0
        ) / validProcessingTimes.length || 0;

      return {
        tickets: ticketsRows,
        averagePendingTime,
        averageProcessingTimeModule,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
  async getTicketPriority(getTicketByIdDto: GetTicketByIdDto) {
    const { id } = getTicketByIdDto;

    if (!id) throw CustomError.badRequest("id property is required");

    try {
      const ticketsRows = await prisma.ticket.findMany({
        where: {
          headquarterId: +id,
          ticketType: TicketStatus.PENDING,
          priority: true,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 10,
      });

      const ticketsCountGeneral = await prisma.ticket.findMany({
        where: {
          headquarterId: +id,
          priority: true,
        },
      });

      const validPendingTimes = ticketsCountGeneral.filter(
        (ticket) =>
          ticket.pendingTimeInSeconds !== null &&
          ticket.pendingTimeInSeconds !== undefined
      );
      const validProcessingTimes = ticketsCountGeneral.filter(
        (ticket) =>
          ticket.processingTimeInSeconds !== null &&
          ticket.processingTimeInSeconds !== undefined
      );

      const averagePendingTime =
        validPendingTimes.reduce(
          (sum, ticket) => sum + ticket.pendingTimeInSeconds!,
          0
        ) / validPendingTimes.length || 0;

      const averageProcessingTimeModule =
        validProcessingTimes.reduce(
          (sum, ticket) => sum + ticket.processingTimeInSeconds!,
          0
        ) / validProcessingTimes.length || 0;

      return {
        tickets: ticketsRows,
        averagePendingTime,
        averageProcessingTimeModule,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getTicketById(getTicketByIdDto: GetTicketByIdDto) {
    const { id } = getTicketByIdDto;

    if (!id) throw CustomError.badRequest("id property is required");

    try {
      const ticket = await prisma.ticket.findFirst({
        where: { id },
        include: {
          ticketMedicines: {
            include: {
              medicine: true,
            },
          },
        },
      });

      if (!ticket) throw CustomError.notFound("ticket not found");

      return {
        ticket,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
