const sha1 = require('sha1');
const Mongo = require('../utils/db');

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
}

module.exports = UsersController;
