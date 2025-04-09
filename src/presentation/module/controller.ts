import { Request, Response } from "express";
import {
  CreateModuleDto,
  CreatePQRDto,
  CustomError,
  GetModuleByIdDto,
  GetPQRByIdDto,
  PaginationDto,
  UpdateModuleDto,
  UpdatePQRDto,
} from "../../domain";
import { PQRService } from "../services/pqr.service";
import { ModuleService } from "../services/module.service";

export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    console.log(`${error}`);
    res.status(500).json({ error: "Internal server error" });
    return;
  };

  public getModules = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.moduleService
      .getModules(paginationDto!)
      .then((modules) => res.json(modules))
      .catch((error) => this.handleError(error, res));
  };

  public getModuleById = async (req: Request, res: Response) => {
    const [error, getModuleByIdDto] = GetModuleByIdDto.create(+req.params.id);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.moduleService
      .getModuleById(getModuleByIdDto!)
      .then((module) => res.status(201).json(module))
      .catch((error) => this.handleError(error, res));
  };

  createModule = (req: Request, res: Response) => {
    const [error, createModuleDto] = CreateModuleDto.create(req.body);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.moduleService
      .createModule(createModuleDto!)
      .then((module) => res.status(201).json(module))
      .catch((error) => this.handleError(error, res));
  };

  updateModule = (req: Request, res: Response) => {
    const [error, updateModuleDto] = UpdateModuleDto.create(req.body);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.moduleService
      .updateModule(updateModuleDto!)
      .then((module) => res.status(201).json(module))
      .catch((error) => this.handleError(error, res));
  };
}
