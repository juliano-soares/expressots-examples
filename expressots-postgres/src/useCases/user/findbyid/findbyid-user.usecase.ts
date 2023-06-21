import { UserRepository } from "@repositories/user/user.repository";
import { provide } from "inversify-binding-decorators";
import {
    IFindbyidUserRequestDTO,
    IFindbyidUserResponseDTO,
} from "./findbyid-user.dto";
import { User } from "@entities/user.entity";
import { IFindAllUserResponseDTO } from "../findall/findall-user.dto";

@provide(FindbyidUserUseCase)
class FindbyidUserUseCase {
    constructor(private userRepository: UserRepository) {}

    async execute(
        payload: IFindbyidUserRequestDTO,
    ): Promise<IFindAllUserResponseDTO | null> {
        try {
            const user: User | null = await this.userRepository.find(
                payload.id,
            );

            if (!user) {
                return null;
            }

            const response: IFindbyidUserResponseDTO = {
                id: user.id,
                name: user.name,
                email: user.email,
            };

            return response;
        } catch (error: any) {
            throw error;
        }
    }
}

export { FindbyidUserUseCase };
