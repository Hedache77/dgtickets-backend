import { createServer } from "http";
import { envs } from "./config/envs";
import { AppRoutes } from "./presentation/routes";
import  Server  from "./presentation/server";
import { WssService } from "./presentation/services/wss.service";
import { prisma } from "./data/postgres";


(() => {

    main();
})()

async function setTimezone() {
    await prisma.$queryRaw`SET TIMEZONE TO 'America/Bogota'`;
  }

async function main() {

    await setTimezone();
    const server = new Server({
        port: envs.PORT,
    });

    const httpServer = createServer(server.app);
    WssService.initWss({ server: httpServer });

    server.setRoutes(AppRoutes.routes );

    httpServer.listen(envs.PORT, () => {
        console.log(`Server running on port: ${envs.PORT}`);
    });

}