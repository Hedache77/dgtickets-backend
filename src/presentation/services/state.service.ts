import { prisma } from "../../data/postgres";
import {
  CreateCountryDto,
  CreateStateDto,
  CustomError,
  PaginationDto,
  UpdateCountryDto,
  UpdateStateDto,
  UserEntity,
} from "../../domain";
import { GetCountryByIdDto } from "../../domain/dtos/country/get-by-id-country.dto";
import { GetStateByIdDto } from "../../domain/dtos/state/get-by-id-state.dto";

export class StateService {
  constructor() {}

  async createState(createStateDto: CreateStateDto) {
    const state = await prisma.state.findFirst({
      where: { name: createStateDto.name },
    });

    if (state) throw CustomError.badRequest("State already exist");

    try {
      const state = await prisma.state.create({
        data: {
          name: createStateDto.name,
          image: createStateDto.image,
          countryId: +createStateDto.countryId,
        },
      });

      return {
        state,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getStateById(getStateByIdDto: GetStateByIdDto) {
    const { id } = getStateByIdDto;

    if (!id) throw CustomError.badRequest("Id property is required");

    if (!id) throw CustomError.badRequest(`${id} is not a number`);

    try {
      const state = await prisma.state.findFirst({
        where: { id },
        include: { country: { select: { name: true } } },
      });

      if (!state) throw CustomError.notFound("State not found");

      return {
        state,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getStates(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    try {
      const [total, states] = await Promise.all([
        prisma.state.count(),
        prisma.state.findMany({
          include: { country: { select: { name: true } } },
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
        states: states,
      };
    } catch (error) {
      throw CustomError.internalServer("Internal Server Error");
    }
  }

  async updateState(updateStateDto: UpdateStateDto) {


    const id = +updateStateDto.id;

    if (!id) throw CustomError.badRequest("Id property is required");

    if (!id) throw CustomError.badRequest(`${id} is not a number`);

    const stateFind = await prisma.state.findFirst({
      where: { id },
    });

    if (!stateFind) throw CustomError.badRequest("State not exist");
    

    const existSameName = await prisma.state.findFirst({
      where: { name: updateStateDto.name },
    });

    if (existSameName) throw CustomError.badRequest("State name already exist");

    try {
      const state = await prisma.state.update({
        where: { id: stateFind.id },
        data: {
          name:
            stateFind.name != updateStateDto.name
              ? updateStateDto.name
              : stateFind.name,
          image:
            stateFind.image != updateStateDto.image
              ? updateStateDto.image
              : stateFind.image,
        },
      });

      return {
        state,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
