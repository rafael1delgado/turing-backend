const { MongoClient } = require('mongodb');
require('dotenv').config();

const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/?retryWrites=true&w=majority`;
const client = new MongoClient(url);

module.exports = {
    client
}
