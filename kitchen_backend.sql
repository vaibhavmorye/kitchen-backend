create schema kitchen_backend;

use kitchen_backend;

create table kitchen_orders(
order_id int auto_increment primary key not null,
product_id int not null,
predicted_qty int,
completed_qty int,
ordered_qty int,
order_date date 
);

create table product_master(
product_id int auto_increment primary key not null,
product_name varchar(30),
raw_material varchar(100),
insert_date date
);

update  kitchen_orders set completed_qty = 3 where kitchen_orders.order_id = 1;
select * from kitchen_orders;

Alter table kitchen_orders 
ADD FOREIGN KEY (product_id) REFERENCES product_master(product_id);

insert into product_master (product_name, insert_date) values('Rice', date(sysdate()));
insert into product_master (product_name, insert_date) values('Mutton curry Rice', date(sysdate()));
insert into product_master (product_name, insert_date) values('Mutton & bhakri', date(sysdate()));
insert into product_master (product_name, insert_date) values('GulabJam', date(sysdate()));

update product_master
set product_name = 'GulabJam'
where product_id = '1';

select * from product_master;

drop table product_master;
drop table kitchen_orders;

update kitchen_orders
set 



select  order_id, p.prod1uct_id , product_name, predicted_qty , completed_qty , ordered_qty , order_date from product_master p , kitchen_orders k where p.product_id = k.product_id and order_date = date(sysdate());


insert into kitchen_orders (product_id , predicted_qty , completed_qty , ordered_qty , order_date) values( 1, 10, 1, 5,  date(sysdate()));
insert into kitchen_orders (product_id , predicted_qty , completed_qty , ordered_qty , order_date) values( 2, 15, 5, 12,  date(sysdate()));
insert into kitchen_orders (product_id , predicted_qty , completed_qty , ordered_qty , order_date) values( 3, 50, 15, 12,  date(sysdate()));
insert into kitchen_orders (product_id , predicted_qty , completed_qty , ordered_qty , order_date) values( 4, 20, 25, 72,  date(sysdate()));





