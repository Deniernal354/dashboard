const session = require("express-session");
const db = require("mysql");
const dbConfig = require("../../config/dbConfig.json");
const redis = require("redis");
const RedisStore = require("connect-redis")(session);

const redisClient = redis.createClient();
const pool = db.createPool(dbConfig);

const queryText1 = "select m.build_id, c.class_id, c.class_name, c.package_name, m.method_name from class c inner join method m on m.class_id=c.class_id and m.pj_id=139 and m.build_id=13777";
const queryText2 = "select m.build_id, c.class_id, c.class_name, c.package_name, m.method_name from class c inner join method m on m.class_id=c.class_id and m.pj_id=139 and m.build_id=13956";
const queryText3 = "select m.build_id, c.class_id, c.class_name, c.package_name, m.method_name from class c inner join method m on m.class_id=c.class_id and m.pj_id=139 and m.build_id=14034";

for (let i = 0; i < 10; i++) {
    pool.query(queryText1, (err, data) => {
        data.forEach(value => {
            redisClient.lpush(value.build_id, `${value.package_name}%%${value.class_name}%%${value.method_name}`);
        });
    });
    pool.query(queryText2, (err, data) => {
        data.forEach(value => {
            redisClient.lpush(value.build_id, `${value.package_name}%%${value.class_name}%%${value.method_name}`);
        });
    });
    pool.query(queryText3, (err, data) => {
        data.forEach(value => {
            redisClient.lpush(value.build_id, `${value.package_name}%%${value.class_name}%%${value.method_name}`);
        });
    });
}

console.log("dd!");
