import { CreateModule } from "@expressots/core";
import { CreateUserController } from "./create/create-user.controller";
import { FindAllUserController } from "./findall/findall-user.controller";
import { UserDeleteController } from "./delete/user-delete.controller";
import { FindbyidUserController } from "./findbyid/findbyid-user.controller";
import { UpdateUserController } from "./update/update-user.controller";

const UserModule = CreateModule([
    CreateUserController,
    UserDeleteController,
    FindAllUserController,
    FindbyidUserController,
    UpdateUserController,
]);

export { UserModule };
