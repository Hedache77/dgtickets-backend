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

    try {
      const headquarter = await prisma.headquarter.create({
        data: {
          name: createHeadquarterDto.name,
          address: createHeadquarterDto.address,
          phoneNumber: createHeadquarterDto.phoneNumber,
          email: createHeadquarterDto.email,
          isActive: !!createHeadquarterDto.isActive,
          cityId: +createHeadquarterDto.cityId
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
        headquarters
      };
    } catch (error) {
      throw CustomError.internalServer("Internal Server Error");
    }
  }

  async updateHeadquarter(updateHeadquarterDto: UpdateHeadquarterDto) {
    const headquarterFind = await prisma.headquarter.findFirst({
      where: { name: updateHeadquarterDto.name },
    });

    if (!headquarterFind) throw CustomError.badRequest("Headquarter not exist");

    try {

      function toBoolean(value: string): boolean {
        return value.toLowerCase() === 'true';
      }

      let valIsActive = toBoolean(updateHeadquarterDto.isActive.toString())


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
