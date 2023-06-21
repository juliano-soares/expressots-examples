import { Report, StatusCode } from "@expressots/core";
import { provide } from "inversify-binding-decorators";
import {
    ICreateUserRequestDTO,
    ICreateUserResponseDTO,
} from "./create-user.dto";
import { UserRepository } from "@repositories/user/user.repository";
import { User } from "@entities/user.entity";

@provide(CreateUserUseCase)
class CreateUserUseCase {
    // eslint-disable-next-line prettier/prettier
    constructor(private userRepository: UserRepository) { }

    async execute(
        data: ICreateUserRequestDTO,
    ): Promise<ICreateUserResponseDTO | null> {
        try {
            const { name, email } = data;

            const userExist = this.userRepository.findByEmail(email);

            if (userExist) {
                Report.Error(
                    "User already exists",
                    StatusCode.BadRequest,
                    "create-user-usecase",
                );
            }

            const user: User | null = await this.userRepository.create(
                new User(name, email),
            );

            let response: ICreateUserResponseDTO;

            if (user !== null) {
                response = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    status: "user created successfully",
                };
                return response;
            }

            return null;
        } catch (error: any) {
            throw error;
        }
    }
}

export { CreateUserUseCase };
