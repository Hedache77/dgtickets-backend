import { Router } from "express";
import { UserService } from "../services/user.service";
import { UsersController } from "./controller";



export class UserRoutes {


    static get routes(): Router {
        const router = Router();
        const userService = new UserService();
        const userController = new UsersController(userService);

        router.get( '/', userController.getUsers );
        router.get( '/:id', userController.getUserById );
        router.post( '/', userController.createUser );
        router.put( '/:id', userController.updateUser );




        return router;
    }

}