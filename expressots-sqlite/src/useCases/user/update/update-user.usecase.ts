import { UserRepository } from "@repositories/user/user.repository";
import { provide } from "inversify-binding-decorators";
import {
    IUpdateUserRequestDTO,
    IUpdateUserResponseDTO,
} from "./update-user.dto";
import { Report, StatusCode } from "@expressots/core";
import { User } from "@entities/user.entity";

@provide(UpdateUserUseCase)
class UpdateUserUseCase {
    // eslint-disable-next-line prettier/prettier
    constructor(private userRepository: UserRepository) { }

    async execute(
        payload: IUpdateUserRequestDTO,
    ): Promise<IUpdateUserResponseDTO | null> {
        try {
            const { email } = payload;

            const user = this.userRepository.findByEmail(email);

            if (!user) {
                Report.Error(
                    "User not found",
                    StatusCode.BadRequest,
                    "user-update-usecase",
                );
            } else {
                user.name = payload.name;
                return (await this.userRepository.update(
                    user as User,
                )) as IUpdateUserResponseDTO | null;
            }

            return null;
        } catch (error: any) {
            throw error;
        }
    }
}

export { UpdateUserUseCase };
