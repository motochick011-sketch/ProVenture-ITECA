-- Create tables in dependency order

create table almsafpa_eduvosprojd.role
(
    id              int auto_increment primary key,
    roleName        varchar(45) not null,
    roleDescription varchar(45) not null
);

create table almsafpa_eduvosprojd.user
(
    userId     int auto_increment primary key,
    name       varchar(50)   not null,
    email      varchar(50)   not null,
    password   varchar(50)   not null,
    roleId     int default 1 not null,
    isDisabled tinyint default 0 not null,
    constraint fk_user_role foreign key (roleId) references almsafpa_eduvosprojd.role (id)
);

create table almsafpa_eduvosprojd.category
(
    id           int auto_increment primary key,
    categoryName char(50)  not null,
    description  char(120) not null,
    icon         varchar(100) default '' not null,
    isDeleted    tinyint default 0 not null
);

create table almsafpa_eduvosprojd.products
(
    id          int auto_increment primary key,
    sellerId    int                                   not null,
    categoryId  int                                   not null,
    name        char(50)                              not null,
    description char(50)                              not null,
    price       double                                not null,
    status      char(20)                              not null,
    createAt    timestamp default current_timestamp() not null on update current_timestamp(),
    image       varchar(255)                          null,
    isDeleted   tinyint default 0                     not null,
    constraint fk_products_seller foreign key (sellerId) references almsafpa_eduvosprojd.user (userId),
    constraint fk_products_category foreign key (categoryId) references almsafpa_eduvosprojd.category (id)
);

create table almsafpa_eduvosprojd.orders
(
    id     int auto_increment primary key,
    userId int                                   not null,
    status char(12)                              not null,
    date   timestamp default current_timestamp() not null,
    constraint fk_orders_user foreign key (userId) references almsafpa_eduvosprojd.user (userId)
);

create table almsafpa_eduvosprojd.cart
(
    id        int auto_increment primary key,
    orderId   int not null,
    productId int not null,
    constraint fk_cart_order foreign key (orderId) references almsafpa_eduvosprojd.orders (id),
    constraint fk_cart_product foreign key (productId) references almsafpa_eduvosprojd.products (id)
);
