import { provide } from "inversify-binding-decorators";
import { UserRepository } from "@repositories/user/user.repository";
import { IFindAllUserResponseDTO } from "./findall-user.dto";

@provide(FindAllUserUseCase)
class FindAllUserUseCase {
    constructor(private userRepository: UserRepository) {}

    async execute(): Promise<IFindAllUserResponseDTO[] | null> {
        try {
            const users = this.userRepository.findAll();
            return users;
        } catch (error: any) {
            throw error;
        }
    }
}

export { FindAllUserUseCase };
