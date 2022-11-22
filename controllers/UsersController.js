const sha1 = require('sha1');
const mongodb = require('mongodb');
const Mongo = require('../utils/db');
const Redis = require('../utils/redis');

class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;
    if (!email) {
      return response.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return response.status(400).json({ error: 'Missing password' });
    }
    if (await Mongo.users.findOne({ email })) {
      return response.status(400).json({ error: 'Already exist' });
    }
    const userVar = await Mongo.users.insertOne({
      email,
      password: sha1(password),
    });
    return response.status(201).json({ id: userVar.insertedId, email });
  }

  static async getMe(request, response) {
    const token = request.headers['x-token'];
    const userSession = await Redis.get(`auth_${token}`);
    if (!userSession) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const user = await Mongo.users.findOne({
      _id: new mongodb.ObjectId(userSession),
    });
    return response.status(200).json({ id: user._id, email: user.email });
  }
}

module.exports = UsersController;
