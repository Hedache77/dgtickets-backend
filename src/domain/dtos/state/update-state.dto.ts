

export class UpdateStateDto {

    private constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly image: string        
    ){}


    static create( object: { [key: string]: any } ): [string?, UpdateStateDto?] {

        const { id, name, image = false } = object;

        if( !id ) return [ 'Missing id' ];
        if( !name ) return [ 'Missing name' ];
        if( !image ) return [ 'Missing image' ];


        return [undefined, new UpdateStateDto(id, name, image)];


    }

}