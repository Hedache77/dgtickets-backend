export class UpdateHeadquarterDto {
  private constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly address: string,
    public readonly phoneNumber: string,
    public readonly isActive: boolean,
    public readonly medicines?: string,
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, UpdateHeadquarterDto?] {
    const { id, name, address, phoneNumber, isActive, medicines } = object;

    if (!id) return ["Missing id"];
    if (!name) return ["Missing name"];
    if (!address) return ["Missing address"];
    if (!phoneNumber) return ["Missing phoneNumber"];
    if (!isActive) return ["Missing isActive"];
    if (typeof !!isActive !== "boolean")
      return ["isActive is not a valid type"];

    return [
      undefined,
      new UpdateHeadquarterDto(
        id,
        name,
        address,
        phoneNumber,
        isActive,
        medicines
      ),
    ];
  }
}
