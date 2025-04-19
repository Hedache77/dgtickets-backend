
export class UpdatePQRDto {

    private constructor(
        public readonly id: number,
        public readonly code: string,
        public readonly description: string,
    ){}


    static create( object: { [key: string]: any } ): [string?, UpdatePQRDto?] {

        const { id, code, description } = object;

        if( !id ) return [ 'Missing id' ];
        if( !code ) return [ 'Missing code' ];
        if( !description ) return [ 'Missing description' ];


        return [undefined, new UpdatePQRDto(id, code, description)];


    }

}