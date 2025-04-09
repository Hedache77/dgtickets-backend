import { UuidAdapter } from "../../config";
import { prisma } from "../../data/postgres";
import {
  CreatePQRDto,
  CreateTicketDto,
  CustomError,
  GetPQRByIdDto,
  GetTicketByIdDto,
  PaginationDto,
  UpdatePQRDto,
  UpdateTicketDto,
} from "../../domain";

export class PQRService {
  constructor() {}

  async createPQR(createPQRDto: CreatePQRDto) {
    try {

      const user = await prisma.user.findFirst({
        where: { id: +createPQRDto.userId },
      });
  
      if (!user) throw CustomError.badRequest("User not exist");


      const pqr = await prisma.pQR.create({
        data: {
          code: UuidAdapter.v4(),
          description: createPQRDto.description,
          userId: +createPQRDto.userId,
        },
      });

      return {
        pqr,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async updatePQR(updatePQRDto: UpdatePQRDto) {
    const pqrFind = await prisma.pQR.findFirst({
      where: { code: updatePQRDto.code },
    });

    if (!pqrFind) throw CustomError.badRequest("PQR not exist");

    try {


      const pqr = await prisma.pQR.update({
        where: { id: pqrFind.id },

        data: {
          description:
          pqrFind.description != updatePQRDto.description
              ? updatePQRDto.description
              : pqrFind.description,
        },
      });

      return {
        pqr,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getPQRS(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    try {
      const [total, pqrs] = await Promise.all([
        prisma.pQR.count(),
        prisma.pQR.findMany({
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
            ? `/api/pqrs?page=${page + 1}&limit=${limit}`
            : null,
        prev:
          page - 1 > 0 ? `/api/pqrs?page=${page - 1}&limit=${limit}` : null,
        pqrs,
      };
    } catch (error) {
      throw CustomError.internalServer("Internal Server Error");
    }
  }

async getPQRById(getPQRByIdDto: GetPQRByIdDto) {
    const { code } = getPQRByIdDto;

    if (!code) throw CustomError.badRequest("code property is required");

    try {
      const pqr = await prisma.pQR.findFirst({ where: { code } });

      if (!pqr) throw CustomError.notFound("pqr not found");

      return {
        pqr,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
