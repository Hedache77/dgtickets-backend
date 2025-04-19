import { Router } from 'express';
import { AuthController } from './controller';
import { envs } from '../../config';
import { AuthService, EmailService } from '../services';




export class AuthRoutes {


  static get routes(): Router {

    const router = Router();

    const emailService = new EmailService(
      envs.MAILER_SERVICE,
      envs.MAILER_EMAIL,
      envs.MAILER_SECRET_KEY
    )
    const authService = new AuthService(emailService);

    const controller = new AuthController(authService);
    

    router.post('/login', controller.loginUser );
    router.post('/register', controller.registerUser );

    router.get('/validate-email/:token', controller.validateEmail );
    router.post('/recovery-password', controller.recoveryPassword );
    router.post('/update-password', controller.updatePassword );
    



    return router;
  }


}

