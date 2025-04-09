
export class UpdateModuleDto {

    private constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly isActive: boolean,
    ){}


    static create( object: { [key: string]: any } ): [string?, UpdateModuleDto?] {

        const { id, name, isActive } = object;

        if( !id ) return [ 'Missing id' ];
        if( isNaN(id) ) return [ `id is not a valid type`];
        if( !name ) return [ 'Missing name' ];
        if( !isActive ) return [ 'Missing isActive' ];


        return [undefined, new UpdateModuleDto(id, name, isActive)];


    }

}