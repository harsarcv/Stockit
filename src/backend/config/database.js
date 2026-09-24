const { Pool } = require('pg')

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'stockit',
    password: '8884710',
    port: 5432
})

module.exports = pool