import { PQRStatus } from "@prisma/client";

export class UpdatePQRDto {
  private constructor(
    public readonly id: number,
    public readonly pqrType: PQRStatus,
    public readonly answer: string,
    public readonly answerByUser: number
  ) {}

  static create(object: { [key: string]: any }): [string?, UpdatePQRDto?] {
    const { id, pqrType, answer, answerByUser } = object;

    if (!id) return ["Missing id"];
    if (!answer) return ["Missing answer"];
    if (!answerByUser) return ["Missing answerByUser"];
    if (isNaN(answerByUser)) return [`answerByUser is not a valid type`];

    return [undefined, new UpdatePQRDto(id, pqrType, answer, answerByUser)];
  }
}
