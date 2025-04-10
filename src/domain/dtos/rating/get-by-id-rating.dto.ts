

export class GetRatingByIdDto {

    private constructor(
        public readonly id: number,    
    ){}


    static create( id: number ): [string?, GetRatingByIdDto?] {


        if( !id ) return [ 'Missing id' ];


        return [undefined, new GetRatingByIdDto(id)];


    }

}