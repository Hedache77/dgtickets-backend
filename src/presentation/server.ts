import express, { Router } from 'express';
import path from 'path';
import cors from 'cors';
import swaggerUI  from 'swagger-ui-express';
import specs from '../swagger/swagger';

interface Options {
    port: number;
    public_path?: string;
}

export default class Server {

    public readonly app = express();
    private serverListener?: any
    private readonly port: number;
    private readonly publicPath: string;

    constructor( options: Options ) {
        const { port, public_path = 'public' } = options;

        this.port = port;
        this.publicPath = public_path;

        this.configure();
    }

    private configure() {
        //* Middlewares
        this.app.use( express.json() ); // raw
        this.app.use( express.urlencoded({ extended: true }) ); // x-www-form-urlencoded

        //* CORS
        this.app.use( cors()) ;

        //* Public Folder
        this.app.use( express.static( this.publicPath ) );

        //* SPA
        this.app.get(/^\/(?!api).*/, (req, res) => {
            const indexPath = path.join( __dirname + `../../../${ this.publicPath }/index.html` );
            res.sendFile( indexPath );
        });

        // swagger
        this.app.use('/api-docs', swaggerUI.serve, swaggerUI.setup( specs ));
    }

     //* Routes
    public setRoutes( routes: Router ) {
        this.app.use( routes );
    }

    async start() {

       

        this.serverListener = this.app.listen(this.port, () => {
            console.log(`Server running on port ${ this.port }`);
        })


    }

    public close() {
        this.serverListener?.close();
    }

}