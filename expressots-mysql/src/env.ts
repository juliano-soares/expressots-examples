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
        MYSQL_HOST: process.env.MYSQL_HOST as string,
        MYSQL_PORT: Number(process.env.MYSQL_PORT),
        MYSQL_USER: process.env.MYSQL_USER as string,
        MYSQL_PASSWORD: process.env.MYSQL_PASSWORD as string,
        MYSQL_DB: process.env.MYSQL_DB as string,
    },
};

export default ENV;
