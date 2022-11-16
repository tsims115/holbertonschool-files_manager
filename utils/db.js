const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.dbName = process.env.DB_DATABASE || 'files_manager';
    this.client = new MongoClient(`mongodb://${this.host}:${this.port}`, { useUnifiedTopology: true });
    this.client.connect();
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const nbUsers = await this.client.db(this.dbName)
    .collection('users')
    .estimatedDocumentCount();
    return nbUsers;
  }

  async nbFiles() {
    const nbfiles = await this.client.db(this.dbName)
    .collection('files')
    .estimatedDocumentCount();
    return nbfiles;
  }

}

const dbClient = new DBClient();

module.exports = dbClient;
