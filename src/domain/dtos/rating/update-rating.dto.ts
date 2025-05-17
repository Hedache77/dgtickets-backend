

export class UpdateRatingDto {

    private constructor(
        public readonly id: number,
        public readonly value: number,
        public readonly description: string,
    ){}


    static create( object: { [key: string]: any } ): [string?, UpdateRatingDto?] {

        const { id, value, description } = object;

        if( !id ) return [ 'Missing id' ];
        // if( !value ) return [ 'Missing value' ];
        // if( !description ) return [ 'Missing description' ];


        return [undefined, new UpdateRatingDto(id, value, description)];


    }

}