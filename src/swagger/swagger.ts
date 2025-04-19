import swaggerJsdoc from 'swagger-jsdoc';
import { OpenAPIV3 } from 'openapi-types';
import path from 'path';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'DGTickets APIs',
            version: '1.0.0',
            description: 'API for managing digital appointments for entities that provide medication delivery services to healthcare providers (EPS). DGTickets allows users to request appointments, track them in real time, and rate the service received. Administrators can manage locations, modules, advisors, and medication inventory, optimizing patient care and reducing in-person lines. \n \n Some useful links: - [DGTickets repository](https://github.com/Hedache77/dgtickets-backend)',
            termsOfService: 'https://dgtickets.com/terms/',
            contact: {
                email: 'dgticketsitm@gmail.com'
            },
            servers: [
                {
                    url: 'http://localhost:3000',
                    description: 'Local server'
                }
            ],

        }
    },
    // apis: ['./src/swagger/swagger.yml']
    apis: [path.join(__dirname, 'swagger.yml')] 
};
const specs = swaggerJsdoc(options) as OpenAPIV3.Document;
export default specs;

// dgticketsitm@gmail.com