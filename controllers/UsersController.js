const { ObjectId } = require('mongodb');
const crypto = require('crypto');
const getDbClient = require('../utils/db');

const postNew = async (req, res) => {
  const { email, password } = req.body;	
  const dbClient = await getDbClient();

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  try {
    const existingUser = await dbClient.userCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    const newUser = { email, password: hashedPassword };

    const result = await dbClient.userCollection.insertOne(newUser);

    const createdUser = {
      id: result.insertedId,
      email,
    };

    return res.status(201).json(createdUser);
  } catch (error) {
    console.error('Error creating new user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers['x-token']);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { _id, email } = user;
    return res.status(200).json({ id: _id, email });
  } catch (error) {
    console.error('Error retrieving user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { postNew, getMe };
