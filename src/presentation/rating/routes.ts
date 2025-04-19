import { Router } from "express";
import { RatingService } from "../services/rating.service";
import { RatingController } from "./controller";



export class RatingRoutes {


    static get routes(): Router {
        const router = Router();
        const ratingService = new RatingService();
        const ratingController = new RatingController( ratingService );

        router.get( '/', ratingController.getRatings );
        router.get( '/:id', ratingController.getRatingById );
        router.post( '/', ratingController.createRating );
        router.put( '/:id', ratingController.updateRating );

        return router;
    }

}