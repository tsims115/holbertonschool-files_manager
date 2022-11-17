import dbClient from '../utils/db';
import redisClient from '../utils/redis';

module.exports = {
  getStatus : function(req, res){
    if (redisClient.isAlive() && dbClient.isAlive()) {
      res.send({ "redis": true, "db": true }, 200);
    }

  },
  getStats : async function(req, res){
    res.send({ "users": await dbClient.nbUsers(), "files": await dbClient.nbFiles() }, 200)
  }
}