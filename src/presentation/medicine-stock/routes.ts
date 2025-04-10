import { Router } from "express";
import { MedicineStockService } from "../services/medicine-stock.service";
import { MedicineStockController } from "./controller";



export class MedicineStockRoutes {


    static get routes(): Router {
        const router = Router();
        const medicineStockService = new MedicineStockService();
        const medicineStockController = new MedicineStockController( medicineStockService );

        router.get( '/', medicineStockController.getMedicineStocks );
        router.get( '/:id', medicineStockController.getMedicineStockById );
        router.post( '/', medicineStockController.createMedicineStock );
        router.put( '/', medicineStockController.updateMedicineStock );

        return router;
    }

}