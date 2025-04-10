import { prisma } from "../../data/postgres";
import {
  CreateMedicineStockDto,
  CustomError,
  GetMedicineStockByIdDto,
  PaginationDto,
  UpdateMedicineStockDto,
} from "../../domain";

export class MedicineStockService {
  constructor() {}

  async createMedicineStock(createMedicineStockDto: CreateMedicineStockDto) {
    
    try {
      function toBoolean(value: string): boolean {
        return value.toLowerCase() === 'true';
      }

      let valActive = toBoolean(createMedicineStockDto.isActive.toString());


      const medicineStock = await prisma.medicine_Stock.create({
        data: {
          name: createMedicineStockDto.name,
          image: createMedicineStockDto.image,
          quantity: +createMedicineStockDto.quantity,
          manufacturer: createMedicineStockDto.manufacturer,
          unitOfMeasure: createMedicineStockDto.unitOfMeasure,
          quantityPerUnit: +createMedicineStockDto.quantityPerUnit,
          isActive: valActive
        },
      });

      return {
        medicineStock,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async updateMedicineStock(updateMedicineStockDto: UpdateMedicineStockDto) {
    const medicineStockFind = await prisma.medicine_Stock.findFirst({
      where: { id: +updateMedicineStockDto.id },
    });

    if (!medicineStockFind) throw CustomError.badRequest("Medicine not exist");


    try {

      function toBoolean(value: string): boolean {
        return value.toLowerCase() === 'true';
      }

      let valActive = toBoolean(updateMedicineStockDto.isActive.toString());





      const medicineStock = await prisma.medicine_Stock.update({
        where: { id: +updateMedicineStockDto.id },

        data: {
          name:
            medicineStockFind.name != updateMedicineStockDto.name
              ? updateMedicineStockDto.name
              : medicineStockFind.name,
          image:
            medicineStockFind.image != updateMedicineStockDto.image
              ? updateMedicineStockDto.image
              : medicineStockFind.image,
          quantity:
            medicineStockFind.quantity != updateMedicineStockDto.quantity
              ? +updateMedicineStockDto.quantity
              : medicineStockFind.quantity,
          manufacturer:
            medicineStockFind.manufacturer != updateMedicineStockDto.manufacturer
              ? updateMedicineStockDto.manufacturer
              : medicineStockFind.manufacturer,
          unitOfMeasure:
            medicineStockFind.unitOfMeasure != updateMedicineStockDto.unitOfMeasure
              ? updateMedicineStockDto.unitOfMeasure
              : medicineStockFind.unitOfMeasure,
          quantityPerUnit:
              medicineStockFind.quantityPerUnit != updateMedicineStockDto.quantityPerUnit
              ? updateMedicineStockDto.quantityPerUnit
              : medicineStockFind.quantityPerUnit,
          isActive:
          medicineStockFind.isActive != valActive
          ? valActive
          : medicineStockFind.isActive,
        },
      });

      return {
        medicineStock,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getMedicineStocks(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    try {
      const [total, medicineStocks] = await Promise.all([
        prisma.medicine_Stock.count(),
        prisma.medicine_Stock.findMany({
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        page: page,
        limit: limit,
        total: total,
        next:
          page < totalPages
            ? `/api/medicine-stocks?page=${page + 1}&limit=${limit}`
            : null,
        prev:
          page - 1 > 0 ? `/api/medicine-stocks?page=${page - 1}&limit=${limit}` : null,
          medicineStocks,
      };
    } catch (error) {
      throw CustomError.internalServer("Internal Server Error");
    }
  }

  async getMedicineStockById(getMedicineStockByIdDto: GetMedicineStockByIdDto) {
    const { id } = getMedicineStockByIdDto;

    if (!id) throw CustomError.badRequest("id property is required");

    try {
      const medicineStock = await prisma.medicine_Stock.findFirst({ where: { id } });

      if (!medicineStock) throw CustomError.notFound("Medicine not found");

      return {
        medicineStock,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
