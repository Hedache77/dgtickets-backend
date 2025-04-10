import { Request, Response } from "express";
import {
  CreatePQRDto,
  CreateRatingDto,
  CustomError,
  GetPQRByIdDto,
  GetRatingByIdDto,
  PaginationDto,
  UpdatePQRDto,
  UpdateRatingDto,
} from "../../domain";
import { PQRService } from "../services/pqr.service";
import { RatingService } from "../services/rating.service";

export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    console.log(`${error}`);
    res.status(500).json({ error: "Internal server error" });
    return;
  };

  public getRatings = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.ratingService
      .getRatings(paginationDto!)
      .then((ratings) => res.json(ratings))
      .catch((error) => this.handleError(error, res));
  };

  public getRatingById = async (req: Request, res: Response) => {
    const [error, getRatingByIdDto] = GetRatingByIdDto.create(+req.params.id);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.ratingService
      .getRatingById(getRatingByIdDto!)
      .then((rating) => res.status(201).json(rating))
      .catch((error) => this.handleError(error, res));
  };

  createRating = (req: Request, res: Response) => {
    const [error, createRatingDto] = CreateRatingDto.create(req.body);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.ratingService
      .createRating(createRatingDto!)
      .then((pqr) => res.status(201).json(pqr))
      .catch((error) => this.handleError(error, res));
  };

  updateRating = (req: Request, res: Response) => {
    const [error, updateRatingDto] = UpdateRatingDto.create(req.body);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.ratingService
      .updatePQR(updateRatingDto!)
      .then((rating) => res.status(201).json(rating))
      .catch((error) => this.handleError(error, res));
  };
}
