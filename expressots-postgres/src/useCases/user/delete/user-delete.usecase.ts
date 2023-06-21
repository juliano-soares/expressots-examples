import { UserRepository } from "@repositories/user/user.repository";
import { provide } from "inversify-binding-decorators";
import {
    IUserDeleteRequestDTO,
    IUserDeleteResponseDTO,
} from "./user-delete.dto";
import { Report, StatusCode } from "@expressots/core";

@provide(UserDeleteUseCase)
class UserDeleteUseCase {
    // eslint-disable-next-line prettier/prettier
    constructor(private userRepository: UserRepository) { }

    async execute(
        payload: IUserDeleteRequestDTO,
    ): Promise<IUserDeleteResponseDTO | null> {
        try {
            const { id } = payload;

            const userDelete = await this.userRepository.delete(id);

            if (!userDelete) {
                Report.Error(
                    "User not found",
                    StatusCode.BadRequest,
                    "user-delete-usecase",
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
