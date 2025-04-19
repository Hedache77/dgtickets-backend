import { Request, Response } from "express";
import {
  CreateCountryDto,
  CreateStateDto,
  CustomError,
  GetCountryByIdDto,
  PaginationDto,
  UpdateCountryDto,
  UpdateStateDto,
} from "../../domain";
import { StateService } from "../services/state.service";
import { GetStateByIdDto } from "../../domain/dtos/state/get-by-id-state.dto";

export class StatesController {

  constructor(private readonly stateService: StateService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    console.log(`${error}`);
    res.status(500).json({ error: "Internal server error" });
    return;
  };

  public getStates = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.stateService
      .getStates(paginationDto!)
      .then((states) => res.json(states))
      .catch((error) => this.handleError(error, res));
  };

    public getStateById = async (req: Request, res: Response) => {
      const [error, getStateByIdDto] = GetStateByIdDto.create(+req.params.id);
      if (error) {
        res.status(400).json({ error });
        return;
      }
  
      this.stateService
        .getStateById(getStateByIdDto!)
        .then((state) => res.status(201).json(state))
        .catch((error) => this.handleError(error, res));
    };

  createState = (req: Request, res: Response) => {
    const [error, createStateDto] = CreateStateDto.create(req.body);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.stateService
      .createState(createStateDto!)
      .then((state) => res.status(201).json(state))
      .catch((error) => this.handleError(error, res));
  };


    updateState = (req: Request, res: Response) => {
      const [error, updateStateDto] = UpdateStateDto.create({id: +req.params.id, ...req.body});
      if (error) {
        res.status(400).json({ error });
        return;
      }
  
      this.stateService
        .updateState(updateStateDto!)
        .then((state) => res.status(201).json(state))
        .catch((error) => this.handleError(error, res));
    };
}
