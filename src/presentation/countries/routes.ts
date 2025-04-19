import { Router } from "express";
import { CountriesController } from "./controller";
import { CountryService } from "../services/country.service";
import { AuthMiddlewre } from "../middlewares/auth.middleware";



export class CountryRoutes {


    static get routes(): Router {
        const router = Router();
        const countryService = new CountryService();
        const countryController = new CountriesController( countryService );

        router.get( '/', countryController.getCountries );
        router.get( '/:id', countryController.getCountryById );
        router.post( '/', countryController.createCountry );
        router.put( '/:id', countryController.updateCountry );




        return router;
    }

}