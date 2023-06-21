import { BaseController, StatusCode } from "@expressots/core";
import {
    controller,
    httpDelete,
    requestParam,
    response,
} from "inversify-express-utils";
import { UserDeleteUseCase } from "./user-delete.usecase";
import {
    IUserDeleteRequestDTO,
    IUserDeleteResponseDTO,
} from "./user-delete.dto";

@controller("/user/delete")
class UserDeleteController extends BaseController {
    constructor(private userDeleteUseCase: UserDeleteUseCase) {
        super("user-delete-controller");
    }

    @httpDelete("/:id")
    execute(
        @requestParam() payload: IUserDeleteRequestDTO,
        @response() res: any,
    ): Promise<IUserDeleteResponseDTO> {
        return this.callUseCaseAsync(
            this.userDeleteUseCase.execute(payload),
            res,
            StatusCode.OK,
        );
    }
}

export { UserDeleteController };
