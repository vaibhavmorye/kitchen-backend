var dbConnection = require('../config/dbconfig');
var Promise = require('promise');
var onChangeHandler;


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
                and order_date = CURRENT_DATE`
    return new Promise(function (resolve, reject) {
        dbConnection.query(query, function (err, rows, fields) {
            if (err) {
                console.log("Error loading from DB" + err);
                return reject(err);
            }
            else {
                return resolve(rows.rows);
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
                return resolve(rows.rows);
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
                   and order_date = CURRENT_DATE
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
                    onChangeHandler(result, 'update_value');
                }).catch((e) => {
                    console.log(e.stack);
                });
            }
        });
    });
}

function addProduct(product) {
    console.log(product);
    let query = `WITH product AS (insert into product_master (product_name, insert_date) 
                 values('${product}', CURRENT_DATE)
                  RETURNING * )
          INSERT INTO kitchen_orders_master(product_id, order_date) 
                 select product.product_id, CURRENT_DATE from product;`
    console.log(query);
    return new Promise(function (resolve, reject) {
        dbConnection.query(query, function (err, rows, fields) {
            if (err) {
                console.log("Error loading from DB" + err);
                return reject(err);

            }
            else {
                return resolve(rows.rows);
            }
        })
    });
}

function placeNewOrder(product, order) {

    let query = `Insert into kitchen_orders (ordered_qty, product_id, order_by, order_date)
                 values(${order}, ${product.product_id},'Admin', CURRENT_DATE)`;

    let mergequery = `INSERT INTO kitchen_orders_master(product_id, ordered_qty, order_date)
                        VALUES(${product.product_id}, ${order}, CURRENT_DATE) 
                        ON CONFLICT (product_id) DO UPDATE SET ordered_qty = kitchen_orders_master.ordered_qty+${order}`;
    return new Promise(function (resolve, reject) {
        console.log(query);

        dbConnection.query(query, function (err, rows, fields) {
            if (err) {
                console.log("Error loading from DB" + err);
                return reject(err);
            } else {
                console.log(mergequery);
                dbConnection.query(mergequery, function (err, rows, fields) {
                    if (err) {
                        console.log("Error loading from DB" + err);
                        return reject(err);
                    } else {
                        return resolve(rows.rows);
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
                return resolve(rows.rows);
            }
        });
    });
}

function generateReports(dates) {
    console.log(dates.from_date);
    let query = `select p.product_id ,
                        product_name,
                        predicted_qty ,
                        completed_qty ,
                        ordered_qty ,
                        order_date
                 from  product_master p , 
                       kitchen_orders_master k
                 where p.product_id = k.product_id
                 and (k.order_date  >= '${dates.from_date}' and k.order_date  <='${dates.to_date}' )`;
    return new Promise(function (resolve, reject) {
        dbConnection.query(query, function (err, rows, fields) {
            if (err) {
                console.log("Error loading from DB" + err);
                return reject(err);
            }
            else {
                return resolve(rows.rows);
            }
        });
    });
}

function kickstart(onChange) {
    onChangeHandler = onChange;
}


module.exports = { kickstart, getAllFoodItems, getSingleFoodItems, updateCompletedOrder, placeNewOrder, addProduct, getAllFoodName, updatePrediction, generateReports }