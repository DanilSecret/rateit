import { Pool } from 'pg';

const pool = new Pool({
    database: process.env.PGSQL_DATABASE,
    user: process.env.PGSQL_USERNAME,
    password: process.env.PGSQL_PASSWORD,
    host: process.env.PGSQL_HOST,
    port: 5432,

});

process.on('SIGTERM', async () => {
    console.log("Closing database connections...");
    await pool.end();
    console.log("Database connections closed.");
    process.exit(0);
});

export default pool;
