var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors')
var app = express();
server = require('http').createServer(app)
var io = require('socket.io').listen(server);
var kitchenService = require('./model/kitchen');
var socketCount;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.set('port', (process.env.PORT || 5000));
app.use(cors());



//getting all products
app.get('/getallFoodItems', function (request, response) {
    kitchenService.getAllFoodItems().then((rows) => {
        response.json(rows);
    }).catch((e) => {
        console.log(e.stack);
    });

})


app.get('/getAllFoodName', function (request, response) {
    kitchenService.getAllFoodName().then((rows) => {
        response.json(rows);
    }).catch((e) => {
        console.log(e.stack);
    });

});

app.post('/addProduct', function (request, response) {
    kitchenService.addProduct(request.body.product_name).then((rows) => {
        response.json({ "status": "success" });
    }).catch((e) => {

        console.log(e.stack);
        throw err("something went wrong");
    });

})

app.post('/placeOrder', function (request, response) {
    kitchenService.placeNewOrder(request.body.productId, request.body.product_order)
        .then((rows) => {
            return response.json({ "status": "success" });
        }).catch((e) => {
            console.log(e.stack);
        });
})


app.post('/addPrediction', function (request, response) {
    kitchenService.updatePrediction(request.body).then((rows) => {
        return response.json({ "status": "success" });
    }).catch((e) => {
        console.log(e.stack);
    });
})

app.post('/generatereports', function (request, response) {
    kitchenService.generateReports(request.body).then((rows) => {
        return response.json(rows);
    }).catch((e) => {
        console.log(e.stack);
    });
});


io.sockets.on('connection', function (socket) {
    socketCount++;
    console.log("user connected  " + socket.id);
    socket.on('disconnect', function () {
        socketCount--;
        console.log('users disconnected');
    });

    socket.on('new-connection', function (socket) {
        kitchenService.getAllUser().then((rows) => {
            io.socket.emit('new-connection', row.stringify());
        }).catch((e) => {
            console.log(e.stack);
        });
    });

    socket.on('order-complete', function (orderData) {
        let jsonOrder = JSON.parse(orderData);
        kitchenService.updateCompletedOrder(jsonOrder)
    });
});

function start(update, type) {
    console.log("start");
    io.emit(type, update);
};


server.listen(app.get('port'), function () {
    console.log("Server listening on  localhost port " + app.get('port'));
});