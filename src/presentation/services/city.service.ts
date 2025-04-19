import { prisma } from "../../data/postgres";
import {
  CreateCityDto,
  CreateCountryDto,
  CustomError,
  GetCityByIdDto,
  PaginationDto,
  UpdateCityDto,
  UpdateCountryDto,
  UserEntity,
} from "../../domain";
import { GetCountryByIdDto } from "../../domain/dtos/country/get-by-id-country.dto";

export class CityService {
  constructor() {}

  async createCity(createCityDto: CreateCityDto) {
    const city = await prisma.city.findFirst({
      where: { name: createCityDto.name },
    });

    if (city) throw CustomError.badRequest("City already exist");

    const existState = await prisma.state.findFirst({
      where: { id: +createCityDto.stateId },
    });
    if (!existState) throw CustomError.badRequest("State not exist");

    try {
      const city = await prisma.city.create({
        data: {
          name: createCityDto.name,
          stateId: +createCityDto.stateId,
          image: createCityDto.image!,
        },
      });

      return {
        city,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getCityById(getCityByIdDto: GetCityByIdDto) {
    const { id } = getCityByIdDto;

    if (!id) throw CustomError.badRequest("Id property is required");

    if (!id) throw CustomError.badRequest(`${id} is not a number`);

    try {
      const city = await prisma.city.findFirst({ where: { id } });

      if (!city) throw CustomError.notFound("City not found");

      return {
        city,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getCities(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    try {
      const [total, cities] = await Promise.all([
        prisma.city.count(),
        prisma.city.findMany({
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
            ? `/api/cities?page=${page + 1}&limit=${limit}`
            : null,
        prev:
          page - 1 > 0 ? `/api/cities?page=${page - 1}&limit=${limit}` : null,
        cities,
      };
    } catch (error) {
      throw CustomError.internalServer("Internal Server Error");
    }
  }

  async updateCity(updateCityDto: UpdateCityDto) {


    const id = +updateCityDto.id;

    if (!id) throw CustomError.badRequest("Id property is required");

    if (!id) throw CustomError.badRequest(`${id} is not a number`);

    const cityFind = await prisma.city.findFirst({
      where: { id },
    });
    
    if (!cityFind) throw CustomError.badRequest("City not exist");

    const existSameName = await prisma.city.findFirst({
      where: { name: updateCityDto.name },
    });

    if (existSameName) throw CustomError.badRequest("City name already exist");

    

    try {
      const city = await prisma.city.update({
        where: { id: cityFind.id },
        data: {
          name:
            cityFind.name != updateCityDto.name
              ? updateCityDto.name
              : cityFind.name,
          image:
            cityFind.image != updateCityDto.image
              ? updateCityDto.image
              : cityFind.image,
        },
      });

      return {
        city,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
