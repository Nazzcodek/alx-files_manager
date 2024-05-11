import { createClient } from 'redis';
import { promisify } from 'util';

const client = createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.setex).bind(client);
const delAsync = promisify(client.del).bind(client);

class RedisClient {
  constructor() {
    client.on('error', (error) => {
      console.log(`Redis client not connected to the server: ${error.message}`);
    });

    client.on('connect', () => {
    });
  }

  isAlive() {
    return client.connected;
  }

  async get(key) {
    try {
      const value = await getAsync(key);
      return value;
    } catch (error) {
      console.error(`Error getting value from Redis: ${error.message}`);
      throw error;
    }
  }

  async set(key, value, duration) {
    try {
      await setAsync(key, duration, value);
    } catch (error) {
      console.error(`Error setting value in Redis: ${error.message}`);
      throw error;
    }
  }

  async del(key) {
    try {
      await delAsync(key);
    } catch (error) {
      console.error(`Error deleting value from Redis: ${error.message}`);
      throw error;
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
