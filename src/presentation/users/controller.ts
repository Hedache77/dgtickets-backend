import { Request, Response } from "express";
import {
  CreateUserDto,
  CustomError,
  GetUserByIdDto,
  PaginationDto,
  UpdateUserDto,
} from "../../domain";

import { UserService } from "../services/user.service";

export class UsersController {
  constructor(private readonly userService: UserService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    console.log(`${error}`);
    res.status(500).json({ error: "Internal server error" });
    return;
  };

  public getUsers = async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search } = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.userService
      .getUsers(paginationDto!, search as string | undefined)
      .then((users) => res.json(users))
      .catch((error) => this.handleError(error, res));
  };

  public getUserById = async (req: Request, res: Response) => {
    const [error, getUserByIdDto] = GetUserByIdDto.create(+req.params.id);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.userService
      .getUserById(getUserByIdDto!)
      .then((user) => res.status(201).json(user))
      .catch((error) => this.handleError(error, res));
  };

  createUser = (req: Request, res: Response) => {
    const [error, createUserDto] = CreateUserDto.create(req.body);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    this.userService
      .createUser(createUserDto!)
      .then((user) => res.status(201).json(user))
      .catch((error) => this.handleError(error, res));
  };

  updateUser = (req: Request, res: Response) => {
    const [error, updateUserDto] = UpdateUserDto.create({id: +req.params.id, ...req.body});
    console.log('aaaaa ', updateUserDto);
    if (error) {
      res.status(400).json({ error });
      return;
    }


    this.userService
      .updateUser(updateUserDto!)
      .then((user) => res.status(201).json(user))
      .catch((error) => this.handleError(error, res));
  };
}
