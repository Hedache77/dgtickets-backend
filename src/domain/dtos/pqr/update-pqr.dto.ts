import { TicketStatus } from "@prisma/client";


export class UpdatePQRDto {

    private constructor(
        public readonly code: string,
        public readonly description: string,
    ){}


    static create( object: { [key: string]: any } ): [string?, UpdatePQRDto?] {

        const { code, description } = object;

        if( !code ) return [ 'Missing code' ];
        if( !description ) return [ 'Missing description' ];


        return [undefined, new UpdatePQRDto(code, description)];


    }

}