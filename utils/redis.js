import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.getAsync = promisify(this.client.get).bind(this.client);

    this.client.on('error', (error) => {
      console.log(`Redis client not connected to the server: ${error.message}`);
    });

    this.client.on('connect', () => {
    });
  }

  isAlive() {
    return this.client.connected;
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
      await this.client.setex(key, duration, value);
    } catch (error) {
      console.error(`Error setting value in Redis: ${error.message}`);
      throw error;
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
