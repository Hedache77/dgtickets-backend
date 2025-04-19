import { Request, Response } from "express";
import {
  CreateCountryDto,
  CreateHeadquarterDto,
  CustomError,
  GetCountryByIdDto,
  PaginationDto,
  UpdateCountryDto,
  UpdateHeadquarterDto,
} from "../../domain";
import { CountryService } from "../services/country.service";
import { HeadquarterService } from "../services/headquarter.service";
import { GetHeadquarterByIdDto } from "../../domain/dtos/headquarter/get-by-id-headquarter.dto";

export class HeadquartersController {
  constructor(private readonly headquarterService: HeadquarterService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    console.log(`${error}`);
    res.status(500).json({ error: "Internal server error" });
    return;
  };

  public getHeadquarters = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.headquarterService
      .getHeadquarters(paginationDto!)
      .then((headquarters) => res.json(headquarters))
      .catch((error) => this.handleError(error, res));
  };

  public getHeadquarterById = async (req: Request, res: Response) => {
    const [error, getHeadquarterByIdDto] = GetHeadquarterByIdDto.create(+req.params.id);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.headquarterService
      .getHeadquarterById(getHeadquarterByIdDto!)
      .then((headquarter) => res.status(201).json(headquarter))
      .catch((error) => this.handleError(error, res));
  };

  createHeadquarter = (req: Request, res: Response) => {
    const [error, createHeadquarterDto] = CreateHeadquarterDto.create(req.body);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.headquarterService
      .createHeadquarter(createHeadquarterDto!)
      .then((headquarter) => res.status(201).json(headquarter))
      .catch((error) => this.handleError(error, res));
  };

  updateHeadquarter = (req: Request, res: Response) => {
    const [error, updateHeadquarterDto] = UpdateHeadquarterDto.create({id: +req.params.id, ...req.body});
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.headquarterService
      .updateHeadquarter(updateHeadquarterDto!)
      .then((headquarter) => res.status(201).json(headquarter))
      .catch((error) => this.handleError(error, res));
  };
}
