export class CreateMedicineStockDto {
  private constructor(
    public readonly name: string,
    public readonly image: string,
    public readonly quantity: number,
    public readonly manufacturer: string,
    public readonly unitOfMeasure: string,
    public readonly quantityPerUnit: number,
    public readonly isActive: boolean,
    public readonly headquarters?: string
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, CreateMedicineStockDto?] {
    const {
      name,
      image,
      quantity,
      manufacturer,
      unitOfMeasure,
      quantityPerUnit,
      isActive,
      headquarters,
    } = object;

    if (!name) return ["Missing name"];
    if (!image) return ["Missing image"];
    if (!quantity) return ["Missing quantity"];
    if (!manufacturer) return ["Missing manufacturer"];
    if (!unitOfMeasure) return ["Missing unitOfMeasure"];
    if (!quantityPerUnit) return ["Missing quantityPerUnit"];
    if (!isActive) return ["Missing isActive"];

    return [
      undefined,
      new CreateMedicineStockDto(
        name,
        image,
        quantity,
        manufacturer,
        unitOfMeasure,
        quantityPerUnit,
        isActive,
        headquarters
      ),
    ];
  }
}
