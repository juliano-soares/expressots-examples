import { UserRepository } from "@repositories/user/user.repository";
import { provide } from "inversify-binding-decorators";
import {
    IUserDeleteRequestDTO,
    IUserDeleteResponseDTO,
} from "./user-delete.dto";
import { AppError, Report, StatusCode } from "@expressots/core";

@provide(UserDeleteUseCase)
class UserDeleteUseCase {
    constructor(private userRepository: UserRepository) {}

    async execute(
        payload: IUserDeleteRequestDTO,
    ): Promise<IUserDeleteResponseDTO | null> {
        try {
            const { id } = payload;

            const userDelete = await this.userRepository.delete(id);

            if (!userDelete) {
                Report.Error(
                    new AppError(
                        StatusCode.BadRequest,
                        "User not found",
                        "user-delete-usecase",
                    ),
                );
            }

            const response: IUserDeleteResponseDTO = {
                status: "User deleted",
            };

            return response;
        } catch (error: any) {
            throw error;
        }
    }
}

export { UserDeleteUseCase };
