import { Pool } from 'pg';

const pool = new Pool({
    database: process.env.PGSQL_DATABASE,
    user: process.env.PGSQL_USERNAME,
    password: process.env.PGSQL_PASSWORD,
    host: process.env.PGSQL_HOST,
    port: 5432,

});


export default pool;
