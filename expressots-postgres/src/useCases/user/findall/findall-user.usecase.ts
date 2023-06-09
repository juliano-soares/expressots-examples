import { provide } from "inversify-binding-decorators";
import { User } from "@entities/user.entity";
import { UserRepository } from "@repositories/user/user.repository";
import { IFindAllUserResponseDTO } from "./findall-user.dto";

@provide(FindAllUserUseCase)
class FindAllUserUseCase {
    constructor(private userRepository: UserRepository) {}

    async execute(): Promise<IFindAllUserResponseDTO[] | null> {
        try {
            const users = await this.userRepository.findAll();
            const response: IFindAllUserResponseDTO[] = [];

            users.forEach((user: User) => {
                response.push({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                });
            });

            return response;
        } catch (error: any) {
            throw error;
        }
    }
}

export { FindAllUserUseCase };
