import { v4 as uuidv4 } from 'uuid';

const sha1 = require('sha1');
const Mongo = require('../utils/db');
const Redis = require('../utils/redis');

class AuthController {
  static async getConnect(request, response) {
    let Authorization = request.headers.authorization.split(' ')[1];
    Authorization = Buffer.from(Authorization, 'base64');
    Authorization = Authorization.toString('utf-8').split(':');
    const email = Authorization[0];
    let password = Authorization[1];
    console.log(email);
    if (password) {
      password = sha1(password);
    } else {
      password = null;
    }
    const user = await Mongo.users.findOne({
      email,
      password,
    });
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const uuidString = uuidv4();
    const key = `auth_${uuidString}`;
    await Redis.set(key, user._id.toString(), 86400);
    return response.status(200).json({ token: uuidString });
  }

  static async getDisconnect(request, response) {
    const token = request.headers['X-token'];
    const userSession = await Redis.get(`auth_${token}`);
    console.log(userSession);
    if (!userSession) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    await Redis.del(`auth_${token}`);
    return response.status(204).json({});
  }
}

module.exports = AuthController;
