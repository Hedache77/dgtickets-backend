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
        return value.toLowerCase() === "true";
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
    const code = updateTicketDto.code;

    if (!code) throw CustomError.badRequest("Code property is required");

    if (!code) throw CustomError.badRequest(`${code} is not a number`);

    const ticketFind = await prisma.ticket.findFirst({
      where: { code: updateTicketDto.code },
    });

    if (!ticketFind) throw CustomError.badRequest("Ticket not exist");

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

        if (!medicineStock) throw CustomError.badRequest("Medicine not exist or not available in this headquarter"); 

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
      const ticket = await prisma.ticket.findFirst({
        where: { code },
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
