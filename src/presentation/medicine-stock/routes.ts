import { Router } from "express";
import { MedicineStockService } from "../services/medicine-stock.service";
import { MedicineStockController } from "./controller";
import { AuthMiddlewre } from "../middlewares/auth.middleware";

export class MedicineStockRoutes {
  static get routes(): Router {
    const router = Router();
    const medicineStockService = new MedicineStockService();
    const medicineStockController = new MedicineStockController(
      medicineStockService
    );

    router.get("/", medicineStockController.getMedicineStocks);
    router.get("/:id", medicineStockController.getMedicineStockById);
    router.post(
      "/",
      [AuthMiddlewre.validateJWT],
      medicineStockController.createMedicineStock
    );
    router.put(
      "/",
      [AuthMiddlewre.validateJWT],
      medicineStockController.updateMedicineStock
    );

    return router;
  }
}
