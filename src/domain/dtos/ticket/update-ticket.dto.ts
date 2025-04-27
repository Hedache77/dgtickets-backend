import { TicketStatus } from "@prisma/client";

export class UpdateTicketDto {
  private constructor(
    public readonly id: number,
    public readonly priority: boolean,
    public readonly ticketType: TicketStatus,
    public readonly serviceData: Date,
    public readonly moduleId: number,
    public readonly userUpdated: number,
    public readonly medicines?: string
  ) {}

  static create(object: { [key: string]: any }): [string?, UpdateTicketDto?] {
    const { id, priority, ticketType, serviceData, moduleId, userUpdated, medicines } =
      object;

    if( !id ) return [ 'Missing id' ];
    if (!priority) return ["Missing priority"];
    if (priority === undefined) return ["Missing priority"];
    // if (typeof priority !== "boolean") return ["priority is not a valid type"];

    if (!moduleId) return ["Missing moduleId"];
    if (!userUpdated) return ["Missing userUpdated"];
    // if (isNaN(moduleId)) return [`moduleId is not a valid type`];

    return [
      undefined,
      new UpdateTicketDto(
        id,
        priority,
        ticketType,
        serviceData,
        moduleId,
        userUpdated,
        medicines
      ),
    ];
  }
}
