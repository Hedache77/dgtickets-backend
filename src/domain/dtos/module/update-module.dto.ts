
export class UpdateModuleDto {

    private constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly isActive: boolean,
        public readonly userId?: number
    ){}


    static create( object: { [key: string]: any } ): [string?, UpdateModuleDto?] {

        const { id, name, isActive, userId } = object;

        if( !id ) return [ 'Missing id' ];
        if( isNaN(id) ) return [ `id is not a valid type`];
        if( !name ) return [ 'Missing name' ];
        if( !isActive ) return [ 'Missing isActive' ];

        if(userId) {
            if( isNaN(userId) ) return [ `userId is not a valid type`];
        }


        return [undefined, new UpdateModuleDto(id, name, isActive, userId)];


    }

}