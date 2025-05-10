import { UuidAdapter } from "../../config";
import { prisma } from "../../data/postgres";
import {
  CreatePQRDto,
  CustomError,
  GetPQRByIdDto,
  PaginationDto,
  UpdatePQRDto,
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
          userId: +createPQRDto.userId,
          description: createPQRDto.description,
          answerByUser: 0,
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

    const id = +updatePQRDto.id;

    if (!id) throw CustomError.badRequest("Id property is required");

    if (!id) throw CustomError.badRequest(`${id} is not a number`);

    const pqrFind = await prisma.pQR.findFirst({
      where: { id },
    });
    
    if (!pqrFind) throw CustomError.badRequest("PQR not exist");

    const userFind = await prisma.user.findFirst({
      where: { id: +updatePQRDto.answerByUser },
    });

    if (!userFind) throw CustomError.badRequest("User not exist");

    try {


      const pqr = await prisma.pQR.update({
        where: { id: pqrFind.id },

        data: {
          pqrType: updatePQRDto.pqrType ? updatePQRDto.pqrType : pqrFind.pqrType,
          answer: updatePQRDto.answer,
          answerByUser: +updatePQRDto.answerByUser,
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
    const { id } = getPQRByIdDto;

    if (!id) throw CustomError.badRequest("id property is required");

    try {
      const pqr = await prisma.pQR.findFirst({ where: { id } });

      if (!pqr) throw CustomError.notFound("pqr not found");

      return {
        pqr,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }


  async getPQRByUser(getPQRByIdDto: GetPQRByIdDto) {
    const { id } = getPQRByIdDto;

    if (!id) throw CustomError.badRequest("id property is required");

    try {
      const pqr = await prisma.pQR.findMany({ where: { userId: +id } });

      if (!pqr) throw CustomError.notFound("pqr not found");

      return {
        pqr,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
