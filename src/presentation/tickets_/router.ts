import { Router } from "express";
import { TicketsController_ } from "./controller";
import { TicketService_ } from "../services/ticket_.service";



export class TicketRoutes_ {


    static get routes(): Router {
        const router = Router();
        const ticketService = new TicketService_();
        const ticketController = new TicketsController_(ticketService);

        router.get( '/', ticketController.getTickets );
        router.get( '/:code', ticketController.getTicketById );
        router.post( '/', ticketController.createTicket );
        router.put( '/:code', ticketController.updateTicket );




        return router;
    }

}