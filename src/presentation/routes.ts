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
      
      TicketRoutes.routes
    );
    router.use("/api/auth", AuthRoutes.routes);
    router.use("/api/states", [AuthMiddlewre.validateJWT], StateRoutes.routes);
    router.use("/api/users", [AuthMiddlewre.validateJWT], UserRoutes.routes);
    router.use("/api/cities", CityRoutes.routes);
    router.use("/api/headquarters", [AuthMiddlewre.validateJWT], HeadquarterRoutes.routes);
    router.use("/api/tickets_", [AuthMiddlewre.validateJWT], TicketRoutes_.routes);
    router.use("/api/pqrs", PQRRoutes.routes);
    router.use("/api/modules", ModuleRoutes.routes);

    return router;
  }
}
