const { MongoClient } = require('mongodb');
require('dotenv').config();

const url = process.env.MONGODB_URL
const client = new MongoClient("mongodb+srv://sebastiaannavas:Osoloco04.@dbturing.4vbwsxn.mongodb.net/?retryWrites=true&w=majority");

module.exports = {
    client
}
