import { prisma } from "../../data/postgres";
import {
  CreateHeadquarterDto,
  CustomError,
  PaginationDto,
  UpdateHeadquarterDto,
} from "../../domain";
import { GetHeadquarterByIdDto } from "../../domain/dtos/headquarter/get-by-id-headquarter.dto";

export class HeadquarterService {
  constructor() {}

  async createHeadquarter(createHeadquarterDto: CreateHeadquarterDto) {
    const headquarter = await prisma.headquarter.findFirst({
      where: { name: createHeadquarterDto.name },
    });

    if (headquarter) throw CustomError.badRequest("headquarter already exist");

    let listMedicines: number[] = [];

    if (createHeadquarterDto.medicineIds) {
      listMedicines = JSON.parse(createHeadquarterDto.medicineIds);
    }

    try {
      const headquarter = await prisma.headquarter.create({
        data: {
          name: createHeadquarterDto.name,
          address: createHeadquarterDto.address,
          phoneNumber: createHeadquarterDto.phoneNumber,
          email: createHeadquarterDto.email,
          isActive: !!createHeadquarterDto.isActive,
          cityId: +createHeadquarterDto.cityId,
          medicines: listMedicines.length
            ? {
                connect: listMedicines.map((id: number) => ({ id: +id })),
              }
            : undefined,
        },
      });

      return {
        headquarter,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getHeadquarterById(getHeadquarterByIdDto: GetHeadquarterByIdDto) {
    const { id } = getHeadquarterByIdDto;

    if (!id) throw CustomError.badRequest("Id property is required");

    if (!id) throw CustomError.badRequest(`${id} is not a number`);

    try {
      const headquarter = await prisma.headquarter.findFirst({ where: { id } });

      if (!headquarter) throw CustomError.notFound("Headquarter not found");

      return {
        headquarter,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getHeadquarters(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    try {
      const [total, headquarters] = await Promise.all([
        prisma.headquarter.count(),
        prisma.headquarter.findMany({
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
            ? `/api/headquarters?page=${page + 1}&limit=${limit}`
            : null,
        prev:
          page - 1 > 0
            ? `/api/headquarters?page=${page - 1}&limit=${limit}`
            : null,
        headquarters,
      };
    } catch (error) {
      throw CustomError.internalServer("Internal Server Error");
    }
  }

  async updateHeadquarter(updateHeadquarterDto: UpdateHeadquarterDto) {

    const id = +updateHeadquarterDto.id;

    if (!id) throw CustomError.badRequest("Id property is required");

    if (!id) throw CustomError.badRequest(`${id} is not a number`);

    const headquarterFind = await prisma.headquarter.findFirst({
      where: { id },
    });
    
    if (!headquarterFind) throw CustomError.badRequest("Headquarter not exist");

    const existSameName = await prisma.headquarter.findFirst({
      where: { name: updateHeadquarterDto.name },
    });

    if (existSameName) throw CustomError.badRequest("Headquarter name already exist");

    try {
      function toBoolean(value: string): boolean {
        return value.toLowerCase() === "true";
      }

      let valIsActive = toBoolean(updateHeadquarterDto.isActive.toString());

      let listMedicines: number[] = [];

      if (updateHeadquarterDto.medicineIds) {
        listMedicines = JSON.parse(updateHeadquarterDto.medicineIds);
      }

      const headquarter = await prisma.headquarter.update({
        where: { id: headquarterFind.id },

        data: {
          name:
            headquarterFind.name != updateHeadquarterDto.name
              ? updateHeadquarterDto.name
              : headquarterFind.name,
          address:
            headquarterFind.address != updateHeadquarterDto.address
              ? updateHeadquarterDto.address
              : headquarterFind.address,
          phoneNumber:
            headquarterFind.phoneNumber != updateHeadquarterDto.phoneNumber
              ? updateHeadquarterDto.phoneNumber
              : headquarterFind.phoneNumber,
          isActive:
            headquarterFind.isActive != valIsActive
              ? valIsActive
              : headquarterFind.isActive,
          medicines: listMedicines.length
            ? {
                connect: listMedicines.map((id: number) => ({ id: +id })),
              }
            : undefined,
        },
      });

      return {
        headquarter,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
