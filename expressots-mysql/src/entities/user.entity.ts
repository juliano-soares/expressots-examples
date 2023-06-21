import { provide } from "inversify-binding-decorators";
import { randomUUID } from "node:crypto";
import { IEntity } from "./base.entity";

@provide(User)
class User implements IEntity {
    id: string;
    name!: string;
    email!: string;

    constructor(name: string, email: string) {
        this.id = randomUUID();
        this.name = name;
        this.email = email;
    }
}

export { User };
