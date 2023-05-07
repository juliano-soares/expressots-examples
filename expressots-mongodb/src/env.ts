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
