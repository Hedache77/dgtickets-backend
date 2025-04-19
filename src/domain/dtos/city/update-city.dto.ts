

export class UpdateCityDto {

    private constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly image: string        
    ){}


    static create( object: { [key: string]: any } ): [string?, UpdateCityDto?] {

        const { id, name, image = false } = object;

        if( !id ) return [ 'Missing id' ];
        if( !name ) return [ 'Missing name' ];
        if( !image ) return [ 'Missing image' ];


        return [undefined, new UpdateCityDto(id, name, image)];


    }

}