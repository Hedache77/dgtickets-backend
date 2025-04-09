

export class GetPQRByIdDto {

    private constructor(
        public readonly code: string,    
    ){}


    static create( code: string ): [string?, GetPQRByIdDto?] {


        if( !code ) return [ 'Missing code' ];


        return [undefined, new GetPQRByIdDto(code)];


    }

}