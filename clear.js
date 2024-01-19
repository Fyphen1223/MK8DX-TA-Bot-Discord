require('dotenv').config();
const { createClient } = require('redis');
const redis = createClient({
    password: process.env.REDISPASS,
    socket: {
        host: process.env.REDIS,
        port: process.env.REDISPORT,
    },
});

redis.connect();

redis.on('ready', () => {
    console.log('Ok!');
    redis.FLUSHALL();
    console.log('Finally done!');
});