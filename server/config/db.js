require('dotenv').config();
const { Pool } = require('pg');
const databaseOptions = require('./databaseOptions');

const pool = new Pool(databaseOptions());

module.exports = pool;
