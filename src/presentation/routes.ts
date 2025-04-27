import { Router } from "express";
import { CountryRoutes } from "./countries/routes";
import { TicketRoutes } from "./tickets/routes";
import { AuthRoutes } from "./Auth/routes";
import { AuthMiddlewre } from "./middlewares/auth.middleware";
import { StateRoutes } from "./states/routes";
import { UserRoutes } from "./users/router";
import { CityRoutes } from "./cities/routes";
import { HeadquarterRoutes } from "./headquarter/routes";
import { TicketRoutes_ } from "./tickets_/router";
import { PQRRoutes } from "./pqr/routes";
import { ModuleRoutes } from "./module/routes";
import { RatingRoutes } from "./rating/routes";
import { MedicineStockRoutes } from "./medicine-stock/routes";
import swaggerUI from "swagger-ui-express";
import specs from "../swagger/swagger";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use(
      "/api/countries",
      CountryRoutes.routes
    );
    router.use(
      "/api/tickets",

      TicketRoutes.routes
    );
    router.use("/api/auth", AuthRoutes.routes);
    router.use("/api/states", StateRoutes.routes);
    router.use("/api/users", [AuthMiddlewre.validateJWT], UserRoutes.routes);
    router.use("/api/cities", CityRoutes.routes);
    router.use("/api/headquarters", HeadquarterRoutes.routes);
    router.use(
      "/api/tickets_",
      TicketRoutes_.routes
    );
    router.use("/api/pqrs", [AuthMiddlewre.validateJWT], PQRRoutes.routes);
    router.use(
      "/api/modules",
      [AuthMiddlewre.validateJWT],
      ModuleRoutes.routes
    );
    router.use(
      "/api/ratings",
      [AuthMiddlewre.validateJWT],
      RatingRoutes.routes
    );
    router.use("/api/medicine-stocks", MedicineStockRoutes.routes);
    return router;
  }
}
