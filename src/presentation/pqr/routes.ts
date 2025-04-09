import { Router } from "express";
import { PQRService } from "../services/pqr.service";
import { PQRController } from "./controller";



export class PQRRoutes {


    static get routes(): Router {
        const router = Router();
        const pqrService = new PQRService();
        const pqrController = new PQRController( pqrService );

        router.get( '/', pqrController.getPQRS );
        router.get( '/:id', pqrController.getPQRById );
        router.post( '/', pqrController.createPQR );
        router.put( '/', pqrController.updatePQR );

        return router;
    }

}