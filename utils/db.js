const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.dbName = process.env.DB_DATABASE || 'files_manager';
    this.connected = false;
    this.client = new MongoClient(`mongodb://${this.host}:${this.port}`, { useUnifiedTopology: true });
    this.client.on('open', () => {
      this.connected = true;
      console.log('MongoDB client connected to the database');
      this.db = this.client.db(this.dbName);
      this.users = this.db.collection('users');
      this.files = this.db.collection('files');
    });
    this.client.connect();
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    const nbUsers = await this.client.db(this.dbName)
      .collection('users')
      .countDocuments();
    return nbUsers;
  }

  async nbFiles() {
    const nbfiles = await this.client.db(this.dbName)
      .collection('files')
      .countDocuments();
    return nbfiles;
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
