

export class CreateModuleDto {

    private constructor(
        public readonly name: string,    
        public readonly headquarterId: number,  
    ){}


    static create( object: { [key: string]: any } ): [string?, CreateModuleDto?] {

        const { name, headquarterId } = object;

        if( !name ) return [ 'Missing name' ];
        if( !headquarterId ) return [ 'Missing headquarterId' ];
        if( isNaN(headquarterId) ) return [ `headquarterId is not a valid type`];



        return [undefined, new CreateModuleDto(name, headquarterId)];


    }

}