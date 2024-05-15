const { createClient } = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor() {
    this.client = createClient();
    this.connected = true;
    this.getAsync = promisify(this.client.get).bind(this.client);

    this.client.on('error', (error) => {
      console.log(`Redis client not connected to the server: ${error.message}`);
      this.connected = false;
    });

    this.client.on('connect', () => {
      this.connected = true;
    });
  }

  isAlive() {
    return this.connected;
  }

  async get(key) {
    try {
      const value = await this.getAsync(key);
      return value;
    } catch (error) {
      console.error(`Error getting value from Redis: ${error.message}`);
      throw error;
    }
  }

  async set(key, value, duration) {
    try {
      this.client.setex(key, duration, value);
    } catch (error) {
      console.error(`Error setting value in Redis: ${error.message}`);
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Error deleting value from Redis: ${error.message}`);
      throw error;
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
