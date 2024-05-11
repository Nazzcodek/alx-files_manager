const sha1 = require('sha1');
const { v4: uuid4 } = require('uuid');
const dbClient = require('../utils/db');
const redis = require('../utils/redis');

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization.split(' ')[1];
    const [email, password] = Buffer.from(authHeader, 'base64').toString('ascii').split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.usersCollection.findOne({ email, password: sha1(password) });
    if (!user || user.password !== sha1(password)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuid4();
    await redis.redisClient.set(`auth_${token}`, user.id.toString(), 'EX', 86400);
    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    const userId = await redis.redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redis.redisClient.del(`auth_${token}`);
    return res.status(204).send();
  }
}

module.exports = AuthController;