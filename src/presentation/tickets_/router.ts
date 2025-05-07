import { Router } from "express";
import { TicketsController_ } from "./controller";
import { TicketService_ } from "../services/ticket_.service";
import { envs } from "../../config";
import { EmailService } from "../services";
import { AuthMiddlewre } from "../middlewares/auth.middleware";

export class TicketRoutes_ {
  static get routes(): Router {
    const router = Router();

    const emailService = new EmailService(
      envs.MAILER_SERVICE,
      envs.MAILER_EMAIL,
      envs.MAILER_SECRET_KEY
    );
    const ticketService = new TicketService_(emailService);
    const ticketController = new TicketsController_(ticketService);

    // CUIDADO
    // no tocar estos endpoints, ni los métodos en el controller ni el service, si necesitan cambiar algo, crear otro endpoint
    // y otro método en el controller y el service

    router.get("/", ticketController.getTickets); // traer todos los tickets creados en todas las sedes
    router.get("/:id", [AuthMiddlewre.validateJWT], ticketController.getTicketById); // traer información del ticket
    router.get("/user/:id", [AuthMiddlewre.validateJWT], ticketController.getTicketsByUser); // traer información de los tickets por id de usuario
    router.post("/", [AuthMiddlewre.validateJWT], ticketController.createTicket); // crear ticket
    router.put("/:id", [AuthMiddlewre.validateJWT], ticketController.updateTicket); // id de ticket para actualizar
    router.get("/row/:id", ticketController.getTicketByRow); // id de la sede para obtener la cola sin prioridad
    router.get("/priority/:id", ticketController.getTicketPriority); // id de la sede para obtener la cola con prioridad
    router.get("/position/:id", [AuthMiddlewre.validateJWT], ticketController.calculatePositionTime); // id de ticket para saber la posición y el tiempo de atención
    router.get("/inprogress/:id", [AuthMiddlewre.validateJWT], ticketController.getTicketInProgressByHeadquarter); // id de la sede para saber los tickets en progreso

    return router;
  }
}
