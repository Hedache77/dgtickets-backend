import { State } from './../../../node_modules/.prisma/client/index.d';
import { Router } from "express";
import { StatesController } from "./controller";
import { CountryService } from "../services/country.service";
import { AuthMiddlewre } from "../middlewares/auth.middleware";
import { StateService } from '../services/state.service';



export class StateRoutes {


    static get routes(): Router {
        const router = Router();

        const stateService = new StateService()
        const statesController = new StatesController(stateService);

        router.get( '/', statesController.getStates );
        router.get( '/:id', statesController.getStateById );
        router.post( '/', statesController.createState );
        router.put( '/:id', statesController.updateState );




        return router;
    }

}