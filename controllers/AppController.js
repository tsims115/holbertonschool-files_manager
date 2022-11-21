import dbClient from '../utils/db';
import redisClient from '../utils/redis';

module.exports = {
  static async getStatus(req, res) {
    const status = {
      redis: redisClient.isAlive(),
      db: dbClient.isAlive()
    };
    res.status(200).json(status);
  }
  statis async getStats(req, res) {
    const stats = {
      users: await dbClient.nbUsers();
      files: await dbClient.nbFiles();
    };
    res.status(200).json(stats);
  }
}
