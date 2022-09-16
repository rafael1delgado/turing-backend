const { MongoClient } = require('mongodb');
require('dotenv').config();

const url = process.env.MONGODB_URL
const client = new MongoClient(url);

module.exports = {
    client
}
