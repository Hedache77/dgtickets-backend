

export class GetModuleByIdDto {

    private constructor(
        public readonly id: number,    
    ){}


    static create( id: number ): [string?, GetModuleByIdDto?] {


        if( !id ) return [ 'Missing id' ];


        return [undefined, new GetModuleByIdDto(id)];


    }

}