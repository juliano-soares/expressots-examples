<table align="center">
    <tr>
        <td align="center">
          <img src="https://avatars.githubusercontent.com/u/124537431?s=200&v=4" width="100px" alt="logo ExpressoTS" />
          <p><strong>ExpressoTS</strong></p>        
        </td>
        <td align="center">
          <p><strong>+</strong></p>
        </td>
        <td align="center">
          <img src="https://avatars.githubusercontent.com/u/45120?s=200&v=4" width="100px" alt="logo MongoDB" />
          <p><strong>MongoDB</strong></p>
        </td>
    </tr>
</table>

A project example of Expresso TS framework with MongoDB database 💾

## Project Dependences

- NodeJS
- Docker 
- MongoDB
- Expresso TS CLI

## Tutorial using docker in development

- Installing docker [Docker Download](https://docs.docker.com/engine/install/ubuntu/)
- Installing NodeJS: [NodeJS Dowload](https://nodejs.org/en/download)
- Installing Expresso TS CLI: [npm](https://www.npmjs.com/package/@expressots/cli) [yarn](https://yarnpkg.com/package/@expressots/cli)
- Installind Docker Compose: [Docker Compose](https://docs.docker.com/compose/)

Use the following command with your package manager in your command shell:
```shell
# yarn
yarn add @expressots/cli

# npm
npm install @expressots/cli
```

- Creating a Expresso TS project with CLI: [ExpressoTS CLI Docs](https://expresso-ts.com/docs/cli/overview)

For create a Expresso TS CLI insert a command in your terminal this command: 

```bash
expressots new expressots-mongodb -p yarn -t opinionated
```

Open your project in your favorite IDE and follow the next steps.

Configure/Create the .env file based on the example

```
# Application
ENVIRONMENT="Development" #Development, Staging, Production
PORT=3000

# Log System
FILE=general #log file name
FOLDER=logs #log folder name

# Database
MONGODB_PORT=27017
MONGODB_DATABASE=expressots
MONGODB_PASSWORD=expressots
MONGODB_USERNAME=expressots
```
- Add MongoDB with the command:

```bash
# Using yarn
yarn add mongodb
yarn add @types/mongodb -D

# Using npm
npm install mongodb
npm install @types/mongodb -D
```

- Creating a Dockerfile
Create a file at the base of your project called Dockefile and insert the following data:

```dockerfile
FROM node:alpine
WORKDIR /usr/app

COPY package.json ./
RUN npm install && npm cache clean --force

COPY tsconfig.json ./

COPY . .
COPY .env ./

EXPOSE ${PORT}

RUN npm run build
CMD ["npm", "run", "dev"]
```
- Creating a .dockerignore

```Dockerfile
node_modules
logs
```

- Creating a Docker Compose file "docker-compose.yml"
```yml
version: "3.7"
services:
  database:
    image: mongo:latest
    container_name: mongodb
    restart: always
    ports:
      - ${MONGODB_PORT}:27017
    environment:
      MONGO_INITDB_USERNAME: ${MONGODB_USERNAME}
      MONGO_INITDB_PASSWORD: ${MONGODB_PASSWORD}
      MONGO_INITDB_DATABASE: ${MONGODB_DATABASE}
    volumes:
      - mongodbdata:/data/mongodbdata
volumes:
  mongodbdata:
    driver: local
```

- Building Docker and Docker Compose

```bash
docker build .
docker-compose up
```
**Ready now you have MongoDB database running with docker**

Your next steps now are to interact with the database by creating tables, adding new entities, querying, deleting and changing data.

- Creating the connection:

Create a provider with this command using ExpressoTS CLI:

```
expressots generate p database/mongodb/mongodb
```

This command will generate a provider file that will be our connection with mmongodb, following the file structure.

```
project-name/
├── src/
|   ├── providers/
│       ├── database/
|           ├── mongodb/
|               ├── mongodb.provider.ts
|
```

Modify the file "mongodb.provider.ts" to have a MongoDB connection.
To add new collections to your MongoDB connection, you just need to insert the collection name into the collections array of the createCollections method.
```ts
import { LogLevel, log } from "@expressots/core";
import ENV from "env";
import { provide } from "inversify-binding-decorators";
import { Db, MongoClient } from "mongodb";

@provide(MongodbProvider)
class MongodbProvider {
    static client: MongoClient;
    static dataSource: Db;

    static async connect() {
        log(LogLevel.Info, "Connecting to MongoDB", "mongodb-provider");
        this.client = new MongoClient(
            `mongodb://${ENV.Database.host}:${ENV.Database.port}/${ENV.Database.database}`,
        );
        await this.client.connect();

        this.dataSource = this.client.db(ENV.Database.database);
        this.createCollections();
        log(LogLevel.Info, "Connected to MongoDB", "mongodb-provider");
    }

    static async disconnect() {
        await this.client.close();
        log(LogLevel.Info, "Disconnecting from MongoDB", "mongodb-provider");
    }

    static async createCollections() {
        try {
            const collections = ["users"]; // Add new collection names here
            const existingCollections = await this.dataSource
                .listCollections()
                .toArray();
            for (const collection of collections) {
                if (existingCollections.some((c) => c.name === collection)) {
                    continue;
                } else {
                    await this.dataSource.createCollection(collection);
                }
            }
            log(LogLevel.Info, "Created collections", "mongodb-provider");
        } catch (error) {
            console.log(error);
            log(
                LogLevel.Error,
                "Error creating collections",
                "mongodb-provider",
            );
        }
    }
}

export { MongodbProvider };
```

- Add your database provider to the application in the application.ts file contained in the following file structure:

```
project-name/
├── src/
|   ├── providers/
│       ├── application/
|           ├── application.ts
|
```

- The file should look like this:

```ts
import { Application, Environments, LogLevel, log } from "@expressots/core";
import { MongodbProvider } from "@providers/database/mongodb/mongodb.provider";
import { provide } from "inversify-binding-decorators";

@provide(App)
class App extends Application {
    protected configureServices(): void {
        Environments.checkAll();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected async postServerInitialization(): Promise<void> {
        await MongodbProvider.connect();
    }

    protected async serverShutdown(): Promise<void> {
        MongodbProvider.disconnect();
        log(LogLevel.Info, "Server is shutting down", "logger-provider");
        super.serverShutdown();
    }
}

const appInstance = new App();

export { appInstance as App };
```

- Now adjust your .env file to have the following data:
```
project-name/
├── src/
|   ├── env.ts
```

```ts
import pkg from "../package.json";

const ENV = {
    Application: {
        APP_NAME: pkg.name,
        APP_VERSION: pkg.version,
        ENVIRONMENT: process.env.ENVIRONMENT as string,
        PORT: Number(process.env.PORT),
    },
    Log: {
        FILE: process.env.FILE as string,
        FOLDER: process.env.FOLDER as string,
    },
    Database: {
        host: process.env.MONGODB_HOST as string,
        user: process.env.MONGODB_USERNAME as string,
        password: process.env.MONGODB_PASSWORD as string,
        port: Number(process.env.MONGODB_PORT),
        database: process.env.MONGODB_DATABASE as string,
    },
};

export default ENV;
```

- Now that we have the connection with the database, i can start our application and see if the database is connected, for this we will use the following command:

```bash
# yarn
yarn dev

# npm
npm run dev
```

- Now let's check if the database was created, for this we will use your favorite database manager, in my case i will use the VSCode Extension [MongoDB for VS Code](https://marketplace.visualstudio.com/items?itemName=mongodb.mongodb-vscode), and we will connect to our database, for this we will use the following url:

```bash
mongodb://localhost:27017/expressots
```
- In this example we already have an entity called user let's just modify the base-repository to accept sql into MongoDB.

This modification will allow us to create a generic repository that will be used by all repositories that we will create in the future. Using this approach we will not need to create the same methods in all repositories, we will only need to create the methods that are specific to each repository.

```
project-name/
├── src/
|   ├── repositories/
│       ├── base-repository.ts
```
```ts
import { provide } from "inversify-binding-decorators";
import { IBaseRepository } from "./base-repository.interface";
import { IEntity } from "@entities/base.entity";
import { OptionalUnlessRequiredId } from "mongodb";
import { MongodbProvider } from "@providers/database/mongodb/mongodb.provider";
import { log } from "console";

@provide(BaseRepository)
class BaseRepository<T extends IEntity> implements IBaseRepository<T> {
    protected tableName!: string;

    async create(item: OptionalUnlessRequiredId<T>): Promise<T | null> {
        try {
            const result = await MongodbProvider.dataSource
                .collection(this.tableName)
                .insertOne(item);
            return { ...item, id: result.insertedId } as T | null;
        } catch (err) {
            log(err, "error", "base-repository");
            return null;
        }
    }

    async update(item: T): Promise<T | null> {
        try {
            const result = await MongodbProvider.dataSource
                .collection(this.tableName)
                .updateOne({ id: item.id }, { $set: item });

            if (result.modifiedCount === 1) {
                return item;
            }

            return null;
        } catch (err) {
            log(err, "error", "base-repository");
            return null;
        }
    }

    async delete(id: string): Promise<boolean> {
        const result = await MongodbProvider.dataSource
            .collection(this.tableName)
            .deleteOne({ id });
        if (result.deletedCount === 1) {
            return true;
        }
        return false;
    }

    async find(id: string): Promise<T | null> {
        const result = await MongodbProvider.dataSource
            .collection(this.tableName)
            .findOne({ id });
        return result as T | null;
    }

    async findAll(): Promise<T[]> {
        const result = await MongodbProvider.dataSource
            .collection(this.tableName)
            .find()
            .toArray();
        return result as T[] | [];
    }
}

export { BaseRepository };
```

- We will also need to modify the base-repository interface with the following code:

```ts
import { OptionalUnlessRequiredId } from "mongodb";

interface IBaseRepository<T> {
    create(item: OptionalUnlessRequiredId<T>): Promise<T | null>;
    update(item: T): Promise<T | null>;
    delete(id: string): Promise<boolean>;
    find(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
}

export { IBaseRepository };
```

- Now let's modify our user.repository.ts file to have the following code:
  
```ts
import { provide } from "inversify-binding-decorators";
import { MongodbProvider } from "@providers/database/mongodb/mongodb.provider";
import { BaseRepository } from "@repositories/base-repository";
import { User } from "@entities/user.entity";

@provide(UserRepository)
class UserRepository extends BaseRepository<User> {
    constructor() {
        super();
        this.tableName = "users";
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await MongodbProvider.dataSource
            .collection(this.tableName)
            .findOne({ email });

        return result as User | null;
    }
}

export { UserRepository };
```

- Now let's modify our create-user.controller.ts file to have the following code:

```ts
import { BaseController, StatusCode } from "@expressots/core";
import {
    controller,
    httpPost,
    requestBody,
    response,
} from "inversify-express-utils";
import {
    ICreateUserRequestDTO,
    ICreateUserResponseDTO,
} from "./create-user.dto";
import { CreateUserUseCase } from "./create-user.usecase";

@controller("/user/create")
class CreateUserController extends BaseController {
    constructor(private createUserUseCase: CreateUserUseCase) {
        super("create-user-controller");
    }

    @httpPost("/")
    async execute(
        @requestBody() data: ICreateUserRequestDTO,
        @response() res: any,
    ): Promise<ICreateUserResponseDTO> {
        return this.callUseCaseAsync(
            this.createUserUseCase.execute(data),
            res,
            StatusCode.Created,
        );
    }
}

export { CreateUserController };
```

- And finally let's modify our create-user.usecase.ts file to have the following code:

```ts
import { AppError, Report, StatusCode } from "@expressots/core";
import { provide } from "inversify-binding-decorators";
import {
    ICreateUserRequestDTO,
    ICreateUserResponseDTO,
} from "./create-user.dto";
import { UserRepository } from "@repositories/user/user.repository";
import { User } from "@entities/user.entity";

@provide(CreateUserUseCase)
class CreateUserUseCase {
    constructor(private userRepository: UserRepository) {}

    async execute(
        data: ICreateUserRequestDTO,
    ): Promise<ICreateUserResponseDTO | null> {
        try {
            const { name, email } = data;

            const userExist = await this.userRepository.findByEmail(email);

            if (userExist) {
                Report.Error(
                    new AppError(
                        StatusCode.BadRequest,
                        "User already exists",
                        "create-user-usecase",
                    ),
                );
            }

            const user: User | null = await this.userRepository.create(
                new User(name, email),
            );

            let response: ICreateUserResponseDTO;

            if (user !== null) {
                response = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    status: "user created successfully",
                };
                return response;
            }

            return null;
        } catch (error: any) {
            throw error;
        }
    }
}

export { CreateUserUseCase };
```

creating a POST type request at the following URL "http://localhost:3000/user/create" with the following request body
```json
{
  "name": "teste",
  "email": "teste@teste.com"
}
```

And view the response in your database.

In this project there are another examples of usecases such as: findall, findbyid, update and delete. You can see the complete code in this repository and use it as a base for your projects.

## Stay in touch

Author - [Juliano Soares](https://github.com/juliano-soares)

## License

Expresso TS [MIT LICENSE](https://github.com/expressots/expressots/blob/main/LICENSE.md).
