import { Router } from "express";
import { TicketsController_ } from "./controller";
import { TicketService_ } from "../services/ticket_.service";



export class TicketRoutes_ {


    static get routes(): Router {
        const router = Router();
        const ticketService = new TicketService_();
        const ticketController = new TicketsController_(ticketService);

        router.get( '/', ticketController.getTickets );
        router.get( '/:id', ticketController.getTicketById );
        router.post( '/', ticketController.createTicket );
        router.put( '/:id', ticketController.updateTicket );
        router.get( '/row/:id', ticketController.getTicketByRow );
        router.get( '/priority/:id', ticketController.getTicketPriority );




        return router;
    }

}