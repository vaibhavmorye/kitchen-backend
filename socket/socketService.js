
// var kitchenService = require('../model/kitchen');
// var app = require('../app');
// var socketCount;

// app.sockets.on('connection', function (socket) {
//     socketCount++;
//     console.log("user connected  " + socket.id + "  " + socketCount);
//     socket.on('disconnect', function () {
//         socketCount--;
//         console.log('users disconnected', socketCount);
//     });

//     socket.on('new-connection', function (socket) {
//         kitchenService.getAllUser().then((rows) => {
//             io.socket.emit('new-connection', row.stringify());
//         }).catch((e) => {
//             console.log(e.stack);
//         });
//     });

//     socket.on('order-complete', function (orderData) {
//         let jsonOrder = JSON.parse(orderData);
//         kitchenService.updateCompletedOrder(jsonOrder)
//     });
// });

// module.exports = { io };