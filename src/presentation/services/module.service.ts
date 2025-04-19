import { prisma } from "../../data/postgres";
import {
  CreateModuleDto,
  CustomError,
  GetModuleByIdDto,
  PaginationDto,
  UpdateModuleDto,
} from "../../domain";

export class ModuleService {
  constructor() {}

  async createModule(createModuleDto: CreateModuleDto) {
    try {
      const moduleExist = await prisma.module.findFirst({
        where: { name: createModuleDto.name },
      });

      if (moduleExist) throw CustomError.badRequest("Module already exist");

      const module = await prisma.module.create({
        data: {
          name: createModuleDto.name,
          headquarterId: +createModuleDto.headquarterId,
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
        modules,
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
        module,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
