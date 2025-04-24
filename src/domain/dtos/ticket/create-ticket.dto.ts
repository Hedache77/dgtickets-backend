export class CreateTicketDto {
  private constructor(
    public readonly priority: boolean,
    public readonly headquarterId: number,
    public readonly userId: number
  ) {}

  static create(object: { [key: string]: any }): [string?, CreateTicketDto?] {
    const { priority, headquarterId, userId } = object;

    if (!priority) return ["Missing priority"];
    if (priority === undefined) return ["Missing priority"];
    if (typeof priority !== "boolean") return ["priority is not a valid type"];
    if (!headquarterId) return ["Missing headquarterId"];
    if (isNaN(headquarterId)) return [`headquarterId is not a valid type`];
    if (!userId) return ["Missing userId"];
    if (isNaN(userId)) return [`userId is not a valid type`];

    return [undefined, new CreateTicketDto(priority, headquarterId, userId)];
  }
}
