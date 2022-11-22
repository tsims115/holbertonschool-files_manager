import { v4 as uuidv4 } from 'uuid';

const mongodb = require('mongodb');
const fs = require('fs');
const Mongo = require('../utils/db');
const Redis = require('../utils/redis');

class FilesController {
  static async postUpload(request, response) {
    let dataUtf8 = 'Data String';
    const token = request.headers['x-token'];
    const userSession = await Redis.get(`auth_${token}`);
    const types = ['folder', 'file', 'image'];
    if (!userSession) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const {
      name, type, parentId = 0, isPublic = false, data,
    } = request.body;
    if (!name) {
      return response.status(400).json({ error: 'Missing name' });
    }
    if (!type || !types.includes(type)) {
      return response.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return response.status(400).json({ error: 'Missing data' });
    }
    if (parentId !== 0) {
      const pid = new mongodb.ObjectId(parentId);
      const file = await Mongo.files.findOne({ _id: pid });
      if (!file) {
        return response.status(400).json({ error: 'Parent not found' });
      }
      if (file.type !== 'folder') {
        return response.status(400).json({ error: 'Parent is not a folder' });
      }
    }
    const userId = new mongodb.ObjectId(userSession);
    if (type === 'folder') {
      const newFile = await Mongo.files.insertOne({
        userId, name, type, isPublic, parentId,
      });
      return response.status(201).send({
        id: newFile.insertedId, userId, name, type, isPublic, parentId,
      });
    }
    const folderName = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
    const localPath = `${folderName}/${uuidv4()}`;
    dataUtf8 = Buffer.from(data, 'base64').toString('utf-8');
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
      id: newFile.insertedId, userId, name, type, isPublic, parentId,
    });
  }
  static async getShow(request, response) {
    const userId = new mongodb.ObjectId(request.params.id);
    const token = request.headers['X-token'];
    const key = `auth_${token}`;
    const redisUser = await Redis.get(authToken);
    if (!redisUser) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const file = await Mongo.files.findOne({ _id: userId });
    if (!file) {
      return response.status(404).json({ error: 'Not found' });
    }
    if (redisUser !== file.userId) {
      return response.status(404).json({ error: 'Not found' });
    }
    return response.status(200).json({
      id: file.id, userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }
  static async getIndex(request, response) {
    const token = request.headers['X-token'];
    const key = `auth_${token}`;
    const redisUser = await Redis.get(authToken);
    if (!redisUser) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const { page = 0, parentId = 0} = request.query;
    let file = "file";
    if (parentId !== 0) {
      file = await Mongo.files.findOne({ parentId: parentId });
      const files = Mongo.files.aggregate([
        { $match: { parentId: new mongodb.ObjectId(parentId) } },
        { $skip: page * 20 },
        { $limit: 20 },
      ]).toArray();
      if (files === []) {
        return response.status(200).json([]);
      }
      let fileList = [];
      for ( let i in files) {
        fileList.push({
          id: i._id,
          userId: i.userId,
          name: i.name,
          type: i.type,
          isPublic: i.isPublic,
          parentId: i.parentId,
        });
      }
      return resonse.status(200).json(fileList);
    }
    const files = await Mongo.files.aggregate([
      { $match: { userId: new mongodb.ObjectId(new mongodb.ObjectId(redisUser)) } },
      { $skip: page * 20 },
      { $limit: 20 },
    ]).toArray();
    for ( let i in files) {
      fileList.push({
        id: i._id,
        userId: i.userId,
        name: i.name,
        type: i.type,
        isPublic: i.isPublic,
        parentId: i.parentId,
      });
    }
    return resonse.status(200).json(fileList);
  }
}

module.exports = FilesController;
