import { UserRepository } from "@repositories/user/user.repository";
import { provide } from "inversify-binding-decorators";
import {
    IUpdateUserRequestDTO,
    IUpdateUserResponseDTO,
} from "./update-user.dto";
import { AppError, Report, StatusCode } from "@expressots/core";
import { User } from "@entities/user.entity";

@provide(UpdateUserUseCase)
class UpdateUserUseCase {
    constructor(private userRepository: UserRepository) {}

    async execute(
        payload: IUpdateUserRequestDTO,
    ): Promise<IUpdateUserResponseDTO | null> {
        try {
            const { email } = payload;

            const user = await this.userRepository.findByEmail(email);

            if (!user) {
                Report.Error(
                    new AppError(
                        StatusCode.BadRequest,
                        "User not found",
                        "user-update-usecase",
                    ),
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
