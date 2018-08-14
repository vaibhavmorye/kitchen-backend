var dbConnection = require('../config/dbconfig');
var Promise = require('promise');


function getAllFoodItems() {
    let query = `select  p.product_id,
                         product_name, 
                         predicted_qty, 
                         completed_qty, 
                         ordered_qty, 
                         order_date
                from     product_master p,
                         kitchen_orders_master k 
                where    p.product_id = k.product_id
                and order_date = date(sysdate())`
    return new Promise(function (resolve, reject) {
        dbConnection.query(query, function (err, rows, fields) {
            if (err) {
                console.log("Error loading from DB" + err);
                return reject(err);
            }
            else {
                return resolve(rows);
            }
        });
    });
}

function getAllFoodName() {
    let query = `select *
                from product_master p`
    return new Promise(function (resolve, reject) {
        dbConnection.query(query, function (err, rows, fields) {
            if (err) {
                console.log("Error loading from DB" + err);
                return reject(err);
            }
            else {
                return resolve(rows);
            }
        });
    });
}

//get by id 
function getSingleFoodItems(id) {
    let query = `select p.product_id ,
                        product_name,
                        predicted_qty ,
                        completed_qty ,
                        ordered_qty ,
                        order_date
                  from  product_master p , 
                        kitchen_orders_master k
                   where p.product_id = k.product_id
                   and order_date = date(sysdate())
                   and k.product_id = ${id}`;
    return new Promise(function (resolve, reject) {
        dbConnection.query(query, function (err, rows, fields) {
            if (err) {
                console.log("Error loading from DB" + err);
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
    console.log(orderData.product_id);
    let query = `update kitchen_orders_master
                 set    completed_qty = completed_qty + 1
                 where  kitchen_orders_master.product_id = ${orderData.product_id}`;
    return new Promise(function (resolve, reject) {
        dbConnection.query(query, function (err, rows, fields) {
            if (err) {
                console.log("Error loading from DB" + err);
                return reject(err);
            }
            else {
                getSingleFoodItems(orderData.product_id).then((rows) => {
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
    console.log(product.productName);
    let query = `insert into product_master (product_name, insert_date) 
                 values('${product}', date(sysdate()));`

    //console.log(query);
    return new Promise(function (resolve, reject) {
        dbConnection.query(query, function (err, rows, fields) {
            if (err) {
                console.log("Error loading from DB" + err);
                return reject(err);
            }
            let orderMaster = `insert into kitchen_orders_master (product_id, order_date) 
                                values('${rows.insertId}', date(sysdate()));`
            dbConnection.query(orderMaster, function (err, rows, fields) {
                if (err) {
                    console.log("Error loading from DB" + err);
                    return reject(err);
                }
                else {
                    return resolve(rows);
                }
            })
        });
    });

}

function placeNewOrder(product, order) {

    let query = `Insert into kitchen_orders (ordered_qty, product_id, order_by, order_date)
                 values(${order}, ${product.product_id},'Admin', date(sysdate()))`;

    let mergequery = `INSERT INTO kitchen_orders_master(product_id, ordered_qty, order_date)
                        VALUES(${product.product_id}, ${order}, date(sysdate())) 
                        ON DUPLICATE KEY UPDATE ordered_qty=ordered_qty+${order}`;

    return new Promise(function (resolve, reject) {
        dbConnection.query(query, function (err, rows, fields) {
            if (err) {
                console.log("Error loading from DB" + err);
                return reject(err);
            } else {
                dbConnection.query(mergequery, function (err, rows, fields) {
                    if (err) {
                        console.log("Error loading from DB" + err);
                        return reject(err);
                    } else {
                        return resolve(rows);
                    }
                });

            }
        });

    });
}

function updatePrediction(prediction) {
    let query = `update kitchen_orders_master
    set    predicted_qty = ${prediction.predicted_qty}
    where  kitchen_orders_master.product_id = ${prediction.productId}`;
    return new Promise(function (resolve, reject) {
        dbConnection.query(query, function (err, rows, fields) {
            if (err) {
                console.log("Error loading from DB" + err);
                return reject(err);
            }
            else {
                return resolve(rows);
            }
        });
    });
}

function generateReports(dates) {
    let query = `select p.product_id ,
                        product_name,
                        predicted_qty ,
                        completed_qty ,
                        ordered_qty ,
                        order_date
                 from  product_master p , 
                       kitchen_orders_master k
                 where p.product_id = k.product_id
                 and (k.order_date between '${dates.from_date}  00:00:00' and '${dates.to_date}  00:00:00' )`;
    return new Promise(function (resolve, reject) {
        dbConnection.query(query, function (err, rows, fields) {
            if (err) {
                console.log("Error loading from DB" + err);
                return reject(err);
            }
            else {
                return resolve(rows);
            }
        });
    });
}

module.exports = { getAllFoodItems, getSingleFoodItems, updateCompletedOrder, placeNewOrder, addProduct, getAllFoodName, updatePrediction, generateReports }