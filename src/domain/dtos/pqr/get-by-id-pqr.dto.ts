

export class GetPQRByIdDto {

    private constructor(
        public readonly id: number,    
    ){}


    static create( id: number ): [string?, GetPQRByIdDto?] {


        if( !id ) return [ 'Missing id' ];


        return [undefined, new GetPQRByIdDto(id)];


    }

}