import { bcryptAdapter } from "../../config";
import { prisma } from "../../data/postgres";
import {
  CreateUserDto,
  CustomError,
  GetUserByIdDto,
  PaginationDto,
  UpdateUserDto,
} from "../../domain";

export class UserService {
  constructor() {}

  async createUser(createUserDto: CreateUserDto) {
    const existUser = await prisma.user.findFirst({
      where: { email: createUserDto.email },
    });
    if (existUser) throw CustomError.badRequest("Email already exist");

    const existCity = await prisma.user.findFirst({
      where: { cityId: +createUserDto.cityId },
    });
    if (!existCity) throw CustomError.badRequest("City not exist");

    try {
      const user = await prisma.user.create({
        data: {
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          email: createUserDto.email,
          password: bcryptAdapter.hash(createUserDto.password),
          photo: createUserDto.photo,
          cityId: +createUserDto.cityId,
        },
      });

      return {
        user,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getUserById(getUserByIdDto: GetUserByIdDto) {
    const { id } = getUserByIdDto;

    if (!id) throw CustomError.badRequest("Id property is required");

    if (!id) throw CustomError.badRequest(`${id} is not a number`);

    try {
      const user = await prisma.user.findFirst({ where: { id } });

      if (!user) throw CustomError.notFound("user not found");

      return {
        user,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getUsers(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    try {
      const [total, users] = await Promise.all([
        prisma.user.count(),
        prisma.user.findMany({
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
            ? `/api/users?page=${page + 1}&limit=${limit}`
            : null,
        prev:
          page - 1 > 0 ? `/api/users?page=${page - 1}&limit=${limit}` : null,
        users,
      };
    } catch (error) {
      throw CustomError.internalServer("Internal Server Error");
    }
  }

  async updateUser(updateUserDto: UpdateUserDto) {

    const id = +updateUserDto.id;

    if (!id) throw CustomError.badRequest("Id property is required");

    if (!id) throw CustomError.badRequest(`${id} is not a number`);

    const userFind = await prisma.user.findFirst({
      where: { id },
    });
    
    if (!userFind) throw CustomError.badRequest("User not exist");

    const emailFind = await prisma.user.findFirst({
      where: { email: updateUserDto.email },
    });
    
    if (emailFind) throw CustomError.badRequest("Email already exist");





    try {
      const user = await prisma.user.update({
        where: { id: userFind.id },
        data: {
          firstName:
            userFind.firstName != updateUserDto.firstName
              ? updateUserDto.firstName
              : userFind.firstName,
          lastName:
            userFind.lastName != updateUserDto.lastName
              ? updateUserDto.lastName
              : userFind.lastName,
          password:
            userFind.password != updateUserDto.password
              ? updateUserDto.password
              : userFind.password,
          photo:
            userFind.photo != updateUserDto.photo
              ? updateUserDto.photo
              : userFind.photo,
          userType:
            userFind.userType != updateUserDto.userType
              ? updateUserDto.userType
              : userFind.userType,
        },
      });

      return {
        user,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
