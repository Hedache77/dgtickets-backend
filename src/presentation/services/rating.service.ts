import { prisma } from "../../data/postgres";
import {
  CreateRatingDto,
  CustomError,
  GetRatingByIdDto,
  PaginationDto,
  UpdateRatingDto,
} from "../../domain";

export class RatingService {
  constructor() {}

  async createRating(createRatingDto: CreateRatingDto) {
    try {
      const ticket = await prisma.ticket.findFirst({
        where: { id: +createRatingDto.ticketId },
      });

      const ratingTicket = await prisma.rating.findFirst({
        where: { ticketId: +createRatingDto.ticketId },
      });

      if (!ticket) throw CustomError.badRequest("Ticket not exist");

      if (ratingTicket)
        throw CustomError.badRequest("Rating already exist for this ticket");

      const rating = await prisma.rating.create({
        data: {
          value: +createRatingDto.value,
          description: createRatingDto.description,
          ticketId: +createRatingDto.ticketId,
        },
      });

      return {
        rating,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async updatePQR(updateRatingDto: UpdateRatingDto) {
    const ratingFind = await prisma.rating.findFirst({
      where: { id: +updateRatingDto.id },
    });

    if (!ratingFind) throw CustomError.badRequest("Rating not exist");

    try {
      const rating = await prisma.rating.update({
        where: { id: +updateRatingDto.id },

        data: {
          value:
            ratingFind.value != updateRatingDto.value
              ? +updateRatingDto.value
              : ratingFind.value,
          description:
            ratingFind.description != updateRatingDto.description
              ? updateRatingDto.description
              : ratingFind.description,
        },
      });

      return {
        rating,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getRatings(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    try {
      const [total, ratings] = await Promise.all([
        prisma.rating.count(),
        prisma.rating.findMany({
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
            ? `/api/ratings?page=${page + 1}&limit=${limit}`
            : null,
        prev:
          page - 1 > 0 ? `/api/ratings?page=${page - 1}&limit=${limit}` : null,
        ratings,
      };
    } catch (error) {
      throw CustomError.internalServer("Internal Server Error");
    }
  }

  async getRatingById(getRatingByIdDto: GetRatingByIdDto) {
    const { id } = getRatingByIdDto;

    if (!id) throw CustomError.badRequest("id property is required");

    try {
      const rating = await prisma.rating.findFirst({ where: { id } });

      if (!rating) throw CustomError.notFound("rating not found");

      return {
        rating,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
