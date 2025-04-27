

export class CreateModuleDto {

    private constructor(
        public readonly name: string,    
        public readonly headquarterId: number,  
        public readonly userId?: number  
    ){}


    static create( object: { [key: string]: any } ): [string?, CreateModuleDto?] {

        const { name, headquarterId, userId } = object;

        if( !name ) return [ 'Missing name' ];
        if( !headquarterId ) return [ 'Missing headquarterId' ];
        
        if(userId) {
            if( isNaN(userId) ) return [ `userId is not a valid type`];
        }



        return [undefined, new CreateModuleDto(name, headquarterId, userId)];


    }

}