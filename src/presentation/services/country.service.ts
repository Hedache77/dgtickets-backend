import { prisma } from "../../data/postgres";
import {
  CreateCountryDto,
  CustomError,
  PaginationDto,
  UpdateCountryDto,
  UserEntity,
} from "../../domain";
import { GetCountryByIdDto } from "../../domain/dtos/country/get-by-id-country.dto";

export class CountryService {
  constructor() {}

  async createCountry(createCountryDto: CreateCountryDto) {
    const country = await prisma.country.findFirst({
      where: { name: createCountryDto.name },
    });

    if (country) throw CustomError.badRequest("Country already exist");

    try {
      const country = await prisma.country.create({
        data: {
          name: createCountryDto.name,
          image: createCountryDto.image!,
        },
      });

      return {
        country,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getCountryById(getCountryByIdDto: GetCountryByIdDto) {
    const { id } = getCountryByIdDto;

    if (!id) throw CustomError.badRequest("Id property is required");

    if (!id) throw CustomError.badRequest(`${id} is not a number`);

    try {
      const country = await prisma.country.findFirst({ where: { id } });

      if (!country) throw CustomError.notFound("Country not found");

      return {
        country,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getCountries(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    try {
      const [total, countries] = await Promise.all([
        prisma.country.count(),
        prisma.country.findMany({
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
            ? `/api/countries?page=${page + 1}&limit=${limit}`
            : null,
        prev:
          page - 1 > 0
            ? `/api/countries?page=${page - 1}&limit=${limit}`
            : null,
        countries: countries.map((country) => ({
          id: country.id,
          name: country.name,
          available: country.image,
        })),
      };
    } catch (error) {
      throw CustomError.internalServer("Internal Server Error");
    }
  }

  async updateCountry(updateCountryDto: UpdateCountryDto) {

    const id = +updateCountryDto.id;

    if (!id) throw CustomError.badRequest("Id property is required");

    if (!id) throw CustomError.badRequest(`${id} is not a number`);

    const countryFind = await prisma.country.findFirst({
      where: { id },
    });
    
    if (!countryFind) throw CustomError.badRequest("Country not exist");

    const existSameName = await prisma.country.findFirst({
      where: { name: updateCountryDto.name },
    });

    if (existSameName) throw CustomError.badRequest("Country name already exist");


    try {
      const country = await prisma.country.update({
        where: { id: countryFind.id },
        data: {
          name:
            countryFind.name != updateCountryDto.name
              ? updateCountryDto.name
              : countryFind.name,
          image:
            countryFind.image != updateCountryDto.image
              ? updateCountryDto.image
              : countryFind.image,
        },
      });

      return {
        country,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
