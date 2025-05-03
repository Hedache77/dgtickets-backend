import { startOfDay, endOfDay } from "date-fns";
import { TicketStatus } from "@prisma/client";
import {
  envs,
  formatEstimatedTime,
  getTimeTickets,
  UuidAdapter,
} from "../../config";
import { prisma } from "../../data/postgres";
import {
  CreateTicketDto,
  CustomError,
  GetTicketByIdDto,
  PaginationDto,
  UpdateTicketDto,
} from "../../domain";
import { TicketPositionInfo } from "../../domain/interfaces/ticket";
import { EmailService } from "./email.service";

export class TicketService_ {
  constructor(private readonly emailService: EmailService) {}

  async createTicket(createTicketDto: CreateTicketDto) {
    const headquarterFind = await prisma.headquarter.findFirst({
      where: { id: +createTicketDto.headquarterId },
    });
    if (!headquarterFind) throw CustomError.badRequest("Headquarter not exist");

    const userFind = await prisma.user.findFirst({
      where: { id: +createTicketDto.userId },
    });
    if (!userFind) throw CustomError.badRequest("User not exist");

    const now = new Date();
    const start = startOfDay(now);
    const end = endOfDay(now);

    const cancelledTicketsCount = await prisma.ticket.count({
      where: {
        userId: +createTicketDto.userId,
        ticketType: TicketStatus.EXPIRED,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    if (cancelledTicketsCount >= 3) {
      throw CustomError.badRequest(
        "The user already has 3 or more missing tickets today."
      );
    }

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

      const infoTicket = await this.calculatePositionTime({ id: ticket.id });
      console.log("aaaa ", infoTicket);

      await this.sendEmailConfirmCreatedTicket({
        ticket: {
          id: ticket.id,
          ticketType: ticket.ticketType,
          priority: ticket.priority,
          pendingTimeInSeconds: ticket.pendingTimeInSeconds,
          processingTimeInSeconds: ticket.processingTimeInSeconds,
          headquarterId: ticket.headquarterId,
          userId: ticket.userId,
          moduleId: ticket.moduleId,
          createdAt: ticket.createdAt.toString(),
          updatedAt: ticket.updatedAt?.toString() || "",
        },
        position: infoTicket.position,
        timeToAttend: infoTicket.estimatedTimeAtentionInSeconds,
      });

      return {
        ticket,
        position: infoTicket.position,
        timeToAttend: infoTicket.estimatedTimeAtentionInSeconds,
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
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      const ticketsCountGeneral = await prisma.ticket.findMany({
        where: {
          headquarterId: +id,
          priority: false,
        },
      });

      const ticketCount = await prisma.ticket.count({
        where: {
          headquarterId: +getTicketByIdDto.id,
          ticketType: TicketStatus.PENDING,
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

      const averagePendingTimeToAttendInSecond =
        validPendingTimes.reduce(
          (sum, ticket) => sum + ticket.pendingTimeInSeconds!,
          0
        ) / validPendingTimes.length || 0;

      const averageProcessingTimeModuleInSecod =
        validProcessingTimes.reduce(
          (sum, ticket) => sum + ticket.processingTimeInSeconds!,
          0
        ) / validProcessingTimes.length || 0;

      return {
        tickets: ticketsRows,
        countPendingTickets: ticketCount,
        averagePendingTimeToAttendInSecond,
        averageProcessingTimeModuleInSecod,
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
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      const ticketsCountGeneral = await prisma.ticket.findMany({
        where: {
          headquarterId: +id,
          priority: true,
        },
      });

      const ticketCount = await prisma.ticket.count({
        where: {
          headquarterId: +getTicketByIdDto.id,
          ticketType: TicketStatus.PENDING,
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

      const averagePendingTimeToAttendInSecond =
        validPendingTimes.reduce(
          (sum, ticket) => sum + ticket.pendingTimeInSeconds!,
          0
        ) / validPendingTimes.length || 0;

      const averageProcessingTimeModuleInSecod =
        validProcessingTimes.reduce(
          (sum, ticket) => sum + ticket.processingTimeInSeconds!,
          0
        ) / validProcessingTimes.length || 0;

      return {
        tickets: ticketsRows,
        countPendingTickets: ticketCount,
        averagePendingTimeToAttendInSecond: averagePendingTimeToAttendInSecond
          ? averagePendingTimeToAttendInSecond
          : ticketCount * 500,
        averageProcessingTimeModuleInSecod: averageProcessingTimeModuleInSecod
          ? averageProcessingTimeModuleInSecod
          : 500,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
  async getTicketInProgressByHeadquarter(getTicketByIdDto: GetTicketByIdDto) {
    const { id } = getTicketByIdDto;

    if (!id) throw CustomError.badRequest("id property is required");

    try {
      const ticketsInProgress = await prisma.ticket.findMany({
        where: {
          headquarterId: +id,
          ticketType: TicketStatus.IN_PROGRESS,
        },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return {
        tickets: ticketsInProgress,
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

  async calculatePositionTime(getTicketByIdDto: GetTicketByIdDto) {
    const { id } = getTicketByIdDto;

    if (!id) throw CustomError.badRequest("id property is required");

    try {
      const findTicket = await prisma.ticket.findFirst({
        where: { id },
      });

      if (!findTicket) throw CustomError.notFound("ticket not found");

      const ticketsInQueue = await prisma.ticket.findMany({
        where: {
          headquarterId: +findTicket.headquarterId,
          ticketType: TicketStatus.PENDING,
          priority: findTicket.priority,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const ticketsInQueuePrioritary = await prisma.ticket.findMany({
        where: {
          headquarterId: +findTicket.headquarterId,
          ticketType: TicketStatus.PENDING,
          priority: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const position = ticketsInQueue.findIndex(
        (ticket) => ticket.id === findTicket.id
      );

      if (position === -1) {
        throw new Error("Ticket not found in queue");
      }

      const totalProcessingTime = ticketsInQueue.reduce((sum, ticket) => {
        return sum + (ticket.processingTimeInSeconds || 0);
      }, 0);

      const totalProcessingTimePriority = ticketsInQueuePrioritary.reduce(
        (sum, ticket) => {
          return sum + (ticket.processingTimeInSeconds || 0);
        },
        0
      );

      const averageProcessingTime =
        ticketsInQueue.length > 0
          ? totalProcessingTime / ticketsInQueue.length
          : 0;
      const averageProcessingTimePriority =
        ticketsInQueuePrioritary.length > 0
          ? totalProcessingTimePriority / ticketsInQueuePrioritary.length
          : 0;

      let estimatedTimeAtentionInSeconds = Math.round(
        position * averageProcessingTime
      );
      let estimatedTimeAtentionInSecondsPriority = Math.round(
        position * averageProcessingTimePriority
      );

      const timePriority = 300;
      const timeNotPriority = 180;

      if (
        estimatedTimeAtentionInSeconds === 0 &&
        findTicket.priority === true
      ) {
        estimatedTimeAtentionInSeconds = timePriority * (position + 1);
      }

      if (
        estimatedTimeAtentionInSeconds === 0 &&
        findTicket.priority === false
      ) {
        estimatedTimeAtentionInSeconds =
          timeNotPriority * (position + 1) +
          (estimatedTimeAtentionInSecondsPriority
            ? estimatedTimeAtentionInSecondsPriority
            : timePriority * (ticketsInQueuePrioritary.length + 1));
      }

      if (
        findTicket.priority === false &&
        estimatedTimeAtentionInSeconds != 0
      ) {
        estimatedTimeAtentionInSeconds += estimatedTimeAtentionInSecondsPriority
          ? estimatedTimeAtentionInSecondsPriority
          : timePriority * (ticketsInQueuePrioritary.length + 1);
      }

      return {
        position: position + 1,
        estimatedTimeAtentionInSeconds,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  private sendEmailConfirmCreatedTicket = async (
    ticket: TicketPositionInfo
  ) => {
    const nameHeadquarter = await prisma.headquarter.findFirst({
      where: { id: ticket.ticket.headquarterId },
      select: { name: true },
    });

    const emailUser = await prisma.user.findFirst({
      where: { id: ticket.ticket.userId },
      select: { email: true },
    });

    const link = `${envs.WEBSERVICE_URL}`;
    const html = `
              <h1>Su ticket se ha creado correctamente</h1>
              <p>A continuación encontrará información de su ticket: </p>
              <p>Sede: ${nameHeadquarter}</p>
              <p>Su posición es; ${ticket.position}</p>
              <p>Tiempo estimado de atención ${formatEstimatedTime(
                ticket.timeToAttend
              )}</p>
              <a href="${link}">Para realizar seguimiento a su ticket de click aquí</a>
          `;

    const options = {
      to: emailUser?.email!,
      subject: "Su ticket se ha creado satisfactoriamente",
      htmlBody: html,
    };

    const isSent = await this.emailService.sendEmail(options);
    if (!isSent) throw CustomError.internalServer("Error sending email");

    return true;
  };
}
