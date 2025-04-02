import { TicketStatus } from "@prisma/client";


export class UpdateTicketDto {

    private constructor(
        public readonly code: string,
        public readonly priority: boolean,
        public readonly ticketType: TicketStatus,
        public readonly serviceData: Date,
        public readonly moduleId: number,
    ){}


    static create( object: { [key: string]: any } ): [string?, UpdateTicketDto?] {

        const { code, priority, ticketType, serviceData, moduleId } = object;

        if( !code ) return [ 'Missing code' ];
        if( !priority ) return [ 'Missing priority' ];
        if( !ticketType ) return [ 'Missing ticketType' ];
        if( !serviceData ) return [ 'Missing serviceData' ];
        if( !moduleId ) return [ 'Missing moduleId' ];
        if( isNaN(moduleId) ) return [ `moduleId is not a valid type`];


        return [undefined, new UpdateTicketDto(code, priority, ticketType, serviceData, moduleId)];


    }

}