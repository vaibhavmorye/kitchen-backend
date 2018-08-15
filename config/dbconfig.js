//var mysql = require('mysql');

// const db_config = {
//     host: "us-cdbr-iron-east-01.cleardb.net",
//     user: "b1f882a98fe879",
//     password: "4452a6bc",
//     database: "kitchen_backend",
// };

var pg = require("pg");

var db_config = "postgres://postgres:qwerty@localhost:5432/kitchen";

var dbConnection;

function handleDisconnect() {
    dbConnection = new pg.Client(db_config);
    console.log("Successfully connected to Database.");
    dbConnection.connect();
    dbConnection.on('error', function (err) {
        console.log('DB ERROR ', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('Lost connection. Reconnecting...');
            handleDisconnect();
        }
        else {
            throw err;
        }
    });
}

handleDisconnect();
module.exports = dbConnection;