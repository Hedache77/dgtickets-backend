

export class UpdateMedicineStockDto {

    private constructor(
        public readonly id: number,    
        public readonly name: string,    
        public readonly image: string,    
        public readonly quantity: number,    
        public readonly manufacturer: string,    
        public readonly unitOfMeasure: string,    
        public readonly quantityPerUnit: number,    
        public readonly isActive: boolean
    ){}


    static create( object: { [key: string]: any } ): [string?, UpdateMedicineStockDto?] {

        const { id, name, image, quantity, manufacturer, unitOfMeasure, quantityPerUnit, isActive } = object;

        if( !id ) return [ 'Missing id' ];
        if( !name ) return [ 'Missing name' ];
        if( !image ) return [ 'Missing image' ];
        if( !quantity ) return [ 'Missing quantity' ];
        if( !manufacturer ) return [ 'Missing manufacturer' ];
        if( !unitOfMeasure ) return [ 'Missing unitOfMeasure' ];
        if( !quantityPerUnit ) return [ 'Missing quantityPerUnit' ];
        if( !isActive ) return [ 'Missing isActive' ];

        return [undefined, new UpdateMedicineStockDto(id, name, image, quantity, manufacturer, unitOfMeasure, quantityPerUnit, isActive)];


    }

}