

export class CreatePQRDto {

    private constructor(
        public readonly description: string,    
        public readonly userId: number,  
    ){}


    static create( object: { [key: string]: any } ): [string?, CreatePQRDto?] {

        const { description, userId } = object;

        if( !description ) return [ 'Missing description' ];
        if( !userId ) return [ 'Missing userId' ];
        if( isNaN(userId) ) return [ `userId is not a valid type`];



        return [undefined, new CreatePQRDto(description, userId)];


    }

}