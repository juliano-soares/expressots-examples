import { BaseController, StatusCode } from "@expressots/core";
import {
    controller,
    httpGet,
    requestParam,
    response,
} from "inversify-express-utils";
import { FindbyidUserUseCase } from "./findbyid-user.usecase";
import {
    IFindbyidUserRequestDTO,
    IFindbyidUserResponseDTO,
} from "./findbyid-user.dto";

@controller("/user/findbyid")
class FindbyidUserController extends BaseController {
    constructor(private findbyidUserUseCase: FindbyidUserUseCase) {
        super("findbyid-user-controller");
    }

    @httpGet("/:id")
    execute(
        @requestParam() payload: IFindbyidUserRequestDTO,
        @response() res: any,
    ): Promise<IFindbyidUserResponseDTO | null> {
        return this.callUseCaseAsync(
            this.findbyidUserUseCase.execute(payload),
            res,
            StatusCode.OK,
        );
    }
}

export { FindbyidUserController };
