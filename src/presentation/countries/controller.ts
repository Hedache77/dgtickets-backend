import { Request, Response } from "express";
import {
  CreateCountryDto,
  CustomError,
  GetCountryByIdDto,
  PaginationDto,
  UpdateCountryDto,
} from "../../domain";
import { CountryService } from "../services/country.service";

export class CountriesController {
  constructor(private readonly countryService: CountryService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    console.log(`${error}`);
    res.status(500).json({ error: "Internal server error" });
    return;
  };

  public getCountries = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.countryService
      .getCountries(paginationDto!)
      .then((countries) => res.json(countries))
      .catch((error) => this.handleError(error, res));
  };

  public getCountryById = async (req: Request, res: Response) => {
    const [error, getCountryByIdDto] = GetCountryByIdDto.create(+req.params.id);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.countryService
      .getCountryById(getCountryByIdDto!)
      .then((country) => res.status(201).json(country))
      .catch((error) => this.handleError(error, res));
  };

  createCountry = (req: Request, res: Response) => {
    const [error, createCountryDto] = CreateCountryDto.create(req.body);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.countryService
      .createCountry(createCountryDto!)
      .then((country) => res.status(201).json(country))
      .catch((error) => this.handleError(error, res));
  };

  updateCountry = (req: Request, res: Response) => {
    const [error, updateCountryDto] = UpdateCountryDto.create({id: +req.params.id, ...req.body});
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.countryService
      .updateCountry(updateCountryDto!)
      .then((country) => res.status(201).json(country))
      .catch((error) => this.handleError(error, res));
  };
}
