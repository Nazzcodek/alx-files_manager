const fs = require('fs');
const { v4: uuid4 } = require('uuid');
const path = require('path');
const { ObjectId } = require('mongodb');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class FileController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      console.log(`User ID not found for token ${token}`);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, type, isPublic, data,
    } = req.body;
    const parentId = req.body.parentId || '0';

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== '0') {
      const parentFile = await dbClient.dbClient.collection('files').findOne({ _id: ObjectId(parentId) });
      if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
      if (parentFile.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
    }

    const folderData = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId === '0' ? 0 : ObjectId(parentId),
    };

    if (type === 'folder') {
      const newFolder = await dbClient.dbClient.collection('files').insertOne({
        userId, name, type, isPublic: isPublic || false, parentId,
      });
      folderData.parentId = parentId === '0' ? 0 : ObjectId(parentId);
      return res.status(201).json({ id: newFolder.insertedId, ...folderData });
    }

    const folderName = process.env.FOLDER_PATH || '/tmp/files_manager';
    const fileId = uuid4();
    const localPath = path.join(folderName, fileId);

    await fs.promises.mkdir(folderName, { recursive: true });
    await fs.promises.writeFile(localPath, Buffer.from(data, 'base64'));

    const newFile = await dbClient.filesCollection.insertOne({ localPath, ...folderData });

    folderData.parentId = parentId === '0' ? 0 : ObjectId(parentId);
    return res.status(201).json({ id: newFile.insertedId, localPath, ...folderData });
  }
}

module.exports = FileController;
