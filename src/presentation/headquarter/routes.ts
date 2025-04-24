import { Router } from "express";
import { HeadquarterService } from "../services/headquarter.service";
import { HeadquartersController } from "./controller";
import { AuthMiddlewre } from "../middlewares/auth.middleware";

export class HeadquarterRoutes {
  static get routes(): Router {
    const router = Router();
    const headquarterService = new HeadquarterService();
    const headquarterController = new HeadquartersController(
      headquarterService
    );

    router.get("/", headquarterController.getHeadquarters);
    router.get("/:id", headquarterController.getHeadquarterById);
    router.post(
      "/",
      [AuthMiddlewre.validateJWT],
      headquarterController.createHeadquarter
    );
    router.put(
      "/",
      [AuthMiddlewre.validateJWT],
      headquarterController.updateHeadquarter
    );

    return router;
  }
}
