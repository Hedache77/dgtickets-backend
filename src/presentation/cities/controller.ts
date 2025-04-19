import { Request, Response } from "express";
import {
  CreateCityDto,
  CreateCountryDto,
  CustomError,
  GetCityByIdDto,
  GetCountryByIdDto,
  PaginationDto,
  UpdateCityDto,
  UpdateCountryDto,
} from "../../domain";
import { CityService } from "../services/city.service";

export class CitiesController {
  constructor(private readonly cityService: CityService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    console.log(`${error}`);
    res.status(500).json({ error: "Internal server error" });
    return;
  };

  public getCities = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.cityService
      .getCities(paginationDto!)
      .then((cities) => res.json(cities))
      .catch((error) => this.handleError(error, res));
  };

  public getCityById = async (req: Request, res: Response) => {
    const [error, getCityByIdDto] = GetCityByIdDto.create(+req.params.id);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.cityService
      .getCityById(getCityByIdDto!)
      .then((city) => res.status(201).json(city))
      .catch((error) => this.handleError(error, res));
  };

  createCity = (req: Request, res: Response) => {
    const [error, createCityDto] = CreateCityDto.create(req.body);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.cityService
      .createCity(createCityDto!)
      .then((city) => res.status(201).json(city))
      .catch((error) => this.handleError(error, res));
  };

  updateCity = (req: Request, res: Response) => {
    const [error, updateCityDto] = UpdateCityDto.create({id: +req.params.id, ...req.body});
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.cityService
      .updateCity(updateCityDto!)
      .then((city) => res.status(201).json(city))
      .catch((error) => this.handleError(error, res));
  };
}
