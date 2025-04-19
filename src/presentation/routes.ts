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
import swaggerUI  from 'swagger-ui-express';
import specs from '../swagger/swagger';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use(
      "/api/countries",
      [AuthMiddlewre.validateJWT],
      CountryRoutes.routes
    );
    router.use(
      "/api/tickets",
      [AuthMiddlewre.validateJWT],
      TicketRoutes.routes
    );
    router.use("/api/auth", AuthRoutes.routes);
    router.use("/api/states", [AuthMiddlewre.validateJWT], StateRoutes.routes);
    router.use("/api/users", [AuthMiddlewre.validateJWT], UserRoutes.routes);
    router.use("/api/cities", [AuthMiddlewre.validateJWT], CityRoutes.routes);
    router.use("/api/headquarters", [AuthMiddlewre.validateJWT], HeadquarterRoutes.routes);
    router.use("/api/tickets_", [AuthMiddlewre.validateJWT], TicketRoutes_.routes);
    router.use("/api/pqrs", [AuthMiddlewre.validateJWT], PQRRoutes.routes);
    router.use("/api/modules", [AuthMiddlewre.validateJWT], ModuleRoutes.routes);
    router.use("/api/ratings", [AuthMiddlewre.validateJWT], RatingRoutes.routes);
    router.use("/api/medicine-stocks", [AuthMiddlewre.validateJWT], MedicineStockRoutes.routes);
    return router;
  }
}
