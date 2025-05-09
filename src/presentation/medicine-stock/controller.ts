import { Request, Response } from "express";
import {
  CreateMedicineStockDto,
  CustomError,
  GetMedicineStockByIdDto,
  PaginationDto,
  UpdateMedicineStockDto,
} from "../../domain";
import { MedicineStockService } from "../services/medicine-stock.service";

export class MedicineStockController {
  constructor(private readonly medicineStockService: MedicineStockService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    console.log(`${error}`);
    res.status(500).json({ error: "Internal server error" });
    return;
  };

  public getMedicineStocks = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.medicineStockService
      .getMedicineStocks(paginationDto!)
      .then((medicineStocks) => res.json(medicineStocks))
      .catch((error) => this.handleError(error, res));
  };

  public getMedicineStockById = async (req: Request, res: Response) => {
    const [error, getMedicineStockByIdDto] = GetMedicineStockByIdDto.create(
      +req.params.id
    );
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.medicineStockService
      .getMedicineStockById(getMedicineStockByIdDto!)
      .then((pqr) => res.status(201).json(pqr))
      .catch((error) => this.handleError(error, res));
  };

  createMedicineStock = (req: Request, res: Response) => {
    const [error, createMedicineStockDto] = CreateMedicineStockDto.create(
      req.body
    );
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.medicineStockService
      .createMedicineStock(createMedicineStockDto!)
      .then((medicineStock) => res.status(201).json(medicineStock))
      .catch((error) => this.handleError(error, res));
  };

  updateMedicineStock = (req: Request, res: Response) => {
    const [error, updateMedicineStockDto] = UpdateMedicineStockDto.create(
      {id: req.params.id, ...req.body}
    );
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.medicineStockService
      .updateMedicineStock(updateMedicineStockDto!)
      .then((medicineStock) => res.status(201).json(medicineStock))
      .catch((error) => this.handleError(error, res));
  };
}
