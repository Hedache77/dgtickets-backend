import { prisma } from "../../data/postgres";
import { formatDates } from "../../config/formatterDate";
import {
  CreateModuleDto,
  CustomError,
  GetModuleByIdDto,
  PaginationDto,
  UpdateModuleDto,
} from "../../domain";
import { TicketStatus } from "@prisma/client";
export class ModuleService {
  constructor() {}

  async createModule(createModuleDto: CreateModuleDto) {
    try {
      const moduleExist = await prisma.module.findFirst({
        where: { name: createModuleDto.name },
      });
      if (moduleExist) throw CustomError.badRequest("Module already exist");
      const headquarterExist = await prisma.headquarter.findFirst({
        where: { id: +createModuleDto.headquarterId },
      });
      if (!headquarterExist) throw CustomError.badRequest("Headquarter not exist");

      if(createModuleDto.userId) {
        const usertExist = await prisma.user.findFirst({
          where: { id: +createModuleDto.userId },
        });
        if (!usertExist) throw CustomError.badRequest("User not exist");
      }

      const module = await prisma.module.create({
        data: {
          name: createModuleDto.name,
          headquarterId: +createModuleDto.headquarterId,
          ...(createModuleDto.userId && { userId: +createModuleDto.userId }),
        },
        include: {
          headquarter: {
            select: { id: true, name: true },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
      });

      return {
        module,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async updateModule(updateModuleDto: UpdateModuleDto) {

    const id = +updateModuleDto.id;

    if (!id) throw CustomError.badRequest("Id property is required");

    if (!id) throw CustomError.badRequest(`${id} is not a number`);

    const moduleFind = await prisma.module.findFirst({
      where: { id },
    });
    
    if (!moduleFind) throw CustomError.badRequest("Module not exist");

    const existSameName = await prisma.module.findFirst({
      where: { name: updateModuleDto.name },
    });

    if (existSameName) throw CustomError.badRequest("Module name already exist");


    if(updateModuleDto.userId) {
      const usertExist = await prisma.user.findFirst({
        where: { id: +updateModuleDto.userId },
      });
      if (!usertExist) throw CustomError.badRequest("User not exist");
    }

    try {
      let valActive = toBoolean(updateModuleDto.isActive.toString());

      function toBoolean(value: string): boolean {
        return value.toLowerCase() === "true";
      }

      const module = await prisma.module.update({
        where: { id: moduleFind.id },

        data: {
          name:
            moduleFind.name != updateModuleDto.name
              ? updateModuleDto.name
              : moduleFind.name,
          isActive:
            moduleFind.isActive != valActive ? valActive : moduleFind.isActive,
            ...(updateModuleDto.userId && { userId: +updateModuleDto.userId }),
        },
        include: {
          headquarter: {
            select: { id: true, name: true },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
      });

      return {
        module,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getModules(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    try {
      const [total, modules] = await Promise.all([
        prisma.module.count(),
        prisma.module.findMany({
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
            ? `/api/modules?page=${page + 1}&limit=${limit}`
            : null,
        prev:
          page - 1 > 0 ? `/api/modules?page=${page - 1}&limit=${limit}` : null,
        modules: formatDates(modules),
      };
    } catch (error) {
      throw CustomError.internalServer("Internal Server Error");
    }
  }

  async getModuleById(getModuleByIdDto: GetModuleByIdDto) {
    const { id } = getModuleByIdDto;

    if (!id) throw CustomError.badRequest("id property is required");

    try {
      const module = await prisma.module.findFirst({ where: { id } });

      if (!module) throw CustomError.notFound("module not found");

      return {
        module: formatDates(module)
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
  async getModuleByHeadquarter(getModuleByIdDto: GetModuleByIdDto) {
    const { id } = getModuleByIdDto;

    if (!id) throw CustomError.badRequest("id property is required");

    try {

      const module = await prisma.module.findMany({
        where: {
          headquarterId: +id,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          tickets: {
            where: {
              ticketType: TicketStatus.IN_PROGRESS,
            },
            take: 1,
            select: {
              id: true,
              ticketType: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });
      

      if (!module) throw CustomError.notFound("modules not found");

      return {
        module: formatDates(module)
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}


