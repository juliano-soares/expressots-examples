import { BaseController, StatusCode } from "@expressots/core";
import { controller, httpGet, response } from "inversify-express-utils";
import { IFindAllUserResponseDTO } from "./findall-user.dto";
import { FindAllUserUseCase } from "./findall-user.usecase";

@controller("/user/findall")
class FindAllUserController extends BaseController {
    constructor(private findAllUserUseCase: FindAllUserUseCase) {
        super("findall-user-controller");
    }

    @httpGet("/")
    async execute(@response() res: any): Promise<IFindAllUserResponseDTO[]> {
        return this.callUseCaseAsync(
            this.findAllUserUseCase.execute(),
            res,
            StatusCode.OK,
        );
    }
}

export { FindAllUserController };
