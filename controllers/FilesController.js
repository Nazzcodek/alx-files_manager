const fs = require('fs');
const { v4: uuid4 } = require('uuid');
const path = require('path');
const { ObjectId } = require('mongodb');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class FileController {
  static async postUpload(req, res) {
    const token = req.header('X-Token')
    if (!token) {
      return res.status(401).json({ error: 'Unathourized' });
    }

    const userToken = await redisClient.get(`auth_${token}`);
    if (!userToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, type, isPublic, data
    } = req.body;
    let parentId = req.body.parantId || '0'

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || ![folder, file, image].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== '0'){
      const file = await dbClient.filesCollection.findOne({ _id: ObjectId(parentId) });
      if (!file) return res.status(400).json({ error: 'Parent not found' });
      if (file.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
    }

    const fileId = uuidv4();

    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const localPath = path.join(folderPath, `${fileId}.${type === 'file' || type === 'image'? 'bin' : ''}${type}`);

    fs.writeFileSync(localPath, Buffer.from(data, 'base64'));

    const newFile = {
      userId: ObjectId(userToken),
      name,
      type,
      isPublic:!!isPublic,
      parentId: parentId || 0,
      localPath,
    };

    const result = await dbClient.filesCollection.insertOne(newFile);
    res.status(201).json(result.ops[0]);
  }
}

module.exports = FileController;
