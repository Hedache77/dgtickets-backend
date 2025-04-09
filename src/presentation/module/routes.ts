import { Router } from "express";
import { ModuleService } from "../services/module.service";
import { ModuleController } from "./controller";



export class ModuleRoutes {


    static get routes(): Router {
        const router = Router();
        const moduleService = new ModuleService();
        const moduleController = new ModuleController( moduleService );

        router.get( '/', moduleController.getModules );
        router.get( '/:id', moduleController.getModuleById );
        router.post( '/', moduleController.createModule );
        router.put( '/', moduleController.updateModule );

        return router;
    }

}