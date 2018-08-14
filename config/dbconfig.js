var mysql = require('mysql');

const db_config = {
    host: "us-cdbr-iron-east-01.cleardb.net",
    user: "b1f882a98fe879",
    password: "4452a6bc",
    database: "kitchen_backend",
};

var dbConnection;

function handleDisconnect() {
    dbConnection = mysql.createConnection(db_config);
    console.log("Successfully connected to Database.");
    dbConnection.connect(function (err) {
        if (err) {
            console.log('Error when connecting to DB: ', err);
            setTimeout(handleDisconnect, 5000);
        }
    });
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