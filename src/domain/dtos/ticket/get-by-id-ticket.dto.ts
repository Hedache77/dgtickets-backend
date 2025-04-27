

export class GetTicketByIdDto {

    private constructor(
        public readonly id: number,   
    ){}


    static create( id: number ): [string?, GetTicketByIdDto?] {


        if( !id ) return [ 'Missing id' ];

        if( isNaN(id) ) return [ `${id} is not a number`];


        return [undefined, new GetTicketByIdDto(id)];


    }

}