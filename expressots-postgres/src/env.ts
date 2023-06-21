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
        POSTGRES_HOST: process.env.POSTGRES_HOST as string,
        POSTGRES_PORT: Number(process.env.POSTGRES_PORT),
        POSTGRES_USER: process.env.POSTGRES_USER as string,
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD as string,
        POSTGRES_DB: process.env.POSTGRES_DB as string,
    },
};

export default ENV;
