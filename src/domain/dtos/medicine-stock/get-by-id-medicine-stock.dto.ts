

export class GetMedicineStockByIdDto {

    private constructor(
        public readonly id: number,    
    ){}


    static create( id: number ): [string?, GetMedicineStockByIdDto?] {


        if( !id ) return [ 'Missing id' ];


        return [undefined, new GetMedicineStockByIdDto(id)];


    }

}