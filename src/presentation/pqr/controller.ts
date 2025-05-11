import { Request, Response } from "express";
import {
  CreatePQRDto,
  CustomError,
  GetPQRByIdDto,
  PaginationDto,
  UpdatePQRDto,
} from "../../domain";
import { PQRService } from "../services/pqr.service";

export class PQRController {
  constructor(private readonly pqrService: PQRService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    console.log(`${error}`);
    res.status(500).json({ error: "Internal server error" });
    return;
  };

  public getPQRS = async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search } = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.pqrService
      .getPQRS(paginationDto!, search as string | undefined)
      .then((pqrs) => res.json(pqrs))
      .catch((error) => this.handleError(error, res));
  };

  public getPQRById = async (req: Request, res: Response) => {
    const [error, getPQRByIdDto] = GetPQRByIdDto.create(+req.params.id);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.pqrService
      .getPQRById(getPQRByIdDto!)
      .then((pqr) => res.status(201).json(pqr))
      .catch((error) => this.handleError(error, res));
  };
  public getPQRByUser = async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search } = req.query;
    const [error1, getPQRByIdDto] = GetPQRByIdDto.create(+req.params.id);
    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    if (error) {
      res.status(400).json({ error });
      return;
    }
    if (error1) {
      res.status(400).json({ error });
      return;
    }

    this.pqrService
      .getPQRByUser(paginationDto!, getPQRByIdDto!)
      .then((pqrs) => res.json(pqrs))
      .catch((error) => this.handleError(error, res));
  };

  createPQR = (req: Request, res: Response) => {
    const [error, createPQRDto] = CreatePQRDto.create(req.body);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.pqrService
      .createPQR(createPQRDto!)
      .then((pqr) => res.status(201).json(pqr))
      .catch((error) => this.handleError(error, res));
  };

  updatePQR = (req: Request, res: Response) => {
    const [error, updatePQRDto] = UpdatePQRDto.create({id: +req.params.id, ...req.body});
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.pqrService
      .updatePQR(updatePQRDto!)
      .then((pqr) => res.status(201).json(pqr))
      .catch((error) => this.handleError(error, res));
  };
}
