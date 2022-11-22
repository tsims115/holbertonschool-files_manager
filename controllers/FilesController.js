import { v4 as uuidv4 } from 'uuid';

const mongodb = require('mongodb');
const fs = require('fs');
const Mongo = require('../utils/db');
const Redis = require('../utils/redis');

class FilesController {
  static async postUpload(request, response) {
    const token = request.headers['x-token'];
    const userSession = await Redis.get(`auth_${token}`);
    const types = ['folder', 'file', 'image'];
    if (!userSession) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const { name, type, parentId=0, isPublic=false, data } = request.body
    if (!name) {
      return response.status(400).json({ error: 'Missing name' });
    }
    if (!type || !types.includes(type)) {
      return response.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return response.status(400).json({ error: 'Missing data' });
    }
    const dataUtf8 = Buffer.from(data, 'base64').toString('utf-8');
    if (parentId !== 0) {
      const pid = new mongodb.ObjectId(parentId);
      const file = await Mongo.files.findOne({ _id: pid });
      if (!file) {
        return response.status(400).json({ error: 'Parent not found' });
      } else if (file.type !== 'folder'){
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }
    const userId = new mongodb.ObjectId(userSession);
    if (type === "folder") {
      const newFile = await Mongo.files.insertOne({
        userId, name, type, isPublic, parentId,
      });
      return response.status(201).send({
        id: newFile.insertedId, userId, name, type, isPublic, parentId
      });
    }
    const folderName = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
    const localPath = `${folderName}/${uuidv4()}`
    fs.writeFile(localPath, dataUtf8, (err) => {
      if (err) throw err;
      console.log('Saved!');
    });
    const newFile = await Mongo.files.insertOne({
      userId,
      name,
      type,
      isPublic,
      parentId,
      localPath,
    });
    return response.status(201).send({
      id: newFile.insertedId, userId, name, type, isPublic, parentId
    })
  }
}

module.exports = FilesController;
