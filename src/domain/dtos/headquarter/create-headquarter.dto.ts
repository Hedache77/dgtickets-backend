import { regularExps } from "../../../config";

export class CreateHeadquarterDto {
  private constructor(
    public readonly name: string,
    public readonly address: string,
    public readonly phoneNumber: string,
    public readonly email: string,
    public readonly isActive: boolean,
    public readonly cityId: number,
    public readonly medicineIds?: string
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, CreateHeadquarterDto?] {
    const { name, address, phoneNumber, email, isActive, cityId, medicineIds } =
      object;

    if (!name) return ["Missing name"];
    if (!address) return ["Missing address"];
    if (!phoneNumber) return ["Missing phoneNumber"];
    if (!email) return ["Missing email"];
    if (!regularExps.email.test(email)) return ["Email is not valid"];
    if (!isActive) return ["Missing isActive"];
    if (typeof !!isActive !== "boolean")
      return ["isActive is not a valid type"];
    if (!cityId) return ["Missing city"];
    if (isNaN(cityId)) return [`cityId is not a valid type`];

    return [
      undefined,
      new CreateHeadquarterDto(
        name,
        address,
        phoneNumber,
        email,
        isActive,
        cityId,
        medicineIds
      ),
    ];
  }
}
