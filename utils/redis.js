import { createClient } from 'redis';

const util = require('util');

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.connected = true;
    this.client.on('error', (err) => {
      console.log('Redis Client Error', err);
      this.client.connected = false;
    });
    this.client.on('connect', () => {
      console.log('Redis client connected to the server');
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    const item = await util.promisify(this.client.get).bind(this.client)(key);
    return item;
  }

  async set(key, value, duration) {
    await this.client.set(key, value);
    this.client.expireat(key, parseInt((new Date()) / 1000, 10) + duration);
  }

  async del(key) {
    await this.client.del(key);
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
