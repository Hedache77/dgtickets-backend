

export class CreateRatingDto {

    private constructor(
        public readonly value: string,    
        public readonly description: string,    
        public readonly ticketId: number,  
    ){}


    static create( object: { [key: string]: any } ): [string?, CreateRatingDto?] {

        const { value, description, ticketId } = object;

        if( !value ) return [ 'Missing value' ];
        if( !description ) return [ 'Missing description' ];
        if( !ticketId ) return [ 'Missing ticketId' ];
        if( isNaN(ticketId) ) return [ `ticketId is not a valid type`];



        return [undefined, new CreateRatingDto(value, description, ticketId)];


    }

}