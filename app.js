var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var Promise = require('promise');
var cors = require('cors')
var app = express();
var io = require('socket.io').listen(3000);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.set('port', (process.env.PORT || 5000));
app.use(cors());

const db_config = {
    host: "localhost",
    user: "root",
    password: "",
    database: "kitchen_backend",
    port: 3306
};

var dbConnection;
handleDisconnect();

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

//getting all products
function getAllFoodItems() {
    let query = "select  order_id, p.product_id , product_name, predicted_qty , completed_qty , ordered_qty , order_date from product_master p , kitchen_orders k where p.product_id = k.product_id and order_date = date(sysdate())"
    return new Promise(function (resolve, reject) {
        dbConnection.query(query, function (err, rows, fields) {
            if (err) {
                console.log("Error loading from DB");
                return reject(err);
            }
            else {
                return resolve(rows);
            }
        });
    });
}

//get by id 
function getFoodItems(id) {
    let query = `select order_id, 
                        p.product_id ,
                        product_name,
                        predicted_qty ,
                        completed_qty ,
                        ordered_qty ,
                        order_date
                  from  product_master p , 
                        kitchen_orders k
                   where p.product_id = k.product_id
                   and order_date = date(sysdate())
                   and k.product_id = ${id}`;
    return new Promise(function (resolve, reject) {
        dbConnection.query(query, function (err, rows, fields) {
            if (err) {
                console.log("Error loading from DB");
                return reject(err);
            }
            else {
                return resolve(rows);
            }
        });
    });
}

//update
function updateCompletedOrder(orderData) {
    let query = `update kitchen_orders set completed_qty = completed_qty + 1 where kitchen_orders.order_id = ${orderData.product_id}`;
    return new Promise(function (resolve, reject) {
        dbConnection.query(query, function (err, rows, fields) {
            if (err) {
                console.log("Error loading from DB" + err);
                return reject(err);
            }
            else {
                getFoodItems(orderData.order_id).then((rows) => {
                    let result = JSON.stringify(rows);
                    start(result, 'update_value');
                }).catch((e) => {
                    console.log(e.stack);
                });
            }
        });
    });
}

function addProduct(product) {
    let query = `update kitchen_orders
                 set ordered_qty = ordered_qty + ${product.product_order} 
                 where product_id =${product.productId}`
    return new Promise(function (resolve, reject) {
        dbConnection.query(query, function (err, rows, fields) {
            if (err) {
                console.log("Error loading from DB");
                return reject(err);
            }
            else {
                return resolve(rows);
            }
        });
    });

}

app.get('/getallFoodItems', function (request, response) {
    getAllFoodItems().then((rows) => {
        response.send(JSON.stringify(rows));
    }).catch((e) => {
        console.log(e.stack);
    });

})

app.get('/addProduct', function (request, response) {
    var product = request.body;
    console.log(product);
    addProduct().then((rows) => {
        response.send(JSON.stringify(rows));
    }).catch((e) => {
        console.log(e.stack);
    });

})

app.post('/placeOrder', function (request, response) {
  console.log(request.body);
  return response.send(request.body);

})

var socketCount = 0;

io.sockets.on('connection', function (socket) {
    socketCount++;
    console.log("user connected  " + socket.id);
    socket.on('disconnect', function () {
        socketCount--;
        console.log('users disconnected');
    });

    socket.on('new-connection', function (socket) {
        getAllUser().then((rows) => {
            io.socket.emit('new-connection', row.stringify());
        }).catch((e) => {
            console.log(e.stack);
        });
    });

    socket.on('order-complete', function (orderData) {
        let jsonOrder = JSON.parse(orderData);
        updateCompletedOrder(jsonOrder)
    });
});



function start(update, type) {
    console.log("start");
    io.emit(type, update);
};


var server = app.listen(app.get('port'), function () {
    console.log("Server listening on  localhost port " + app.get('port'));
});