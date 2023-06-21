import { BaseController, StatusCode } from "@expressots/core";
import {
    controller,
    httpPut,
    requestBody,
    response,
} from "inversify-express-utils";
import { UpdateUserUseCase } from "./update-user.usecase";
import {
    IUpdateUserRequestDTO,
    IUpdateUserResponseDTO,
} from "./update-user.dto";

@controller("/user/update")
class UpdateUserController extends BaseController {
    constructor(private updateUserUseCase: UpdateUserUseCase) {
        super("update-user-controller");
    }

    @httpPut("/")
    execute(
        @requestBody() payload: IUpdateUserRequestDTO,
        @response() res: any,
    ): Promise<IUpdateUserResponseDTO | null> {
        return this.callUseCaseAsync(
            this.updateUserUseCase.execute(payload),
            res,
            StatusCode.OK,
        );
    }
}

export { UpdateUserController };
