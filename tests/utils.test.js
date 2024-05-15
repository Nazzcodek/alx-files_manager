/* eslint-disable jest/lowercase-name */
/* eslint-disable jest/valid-expect */
/* eslint-disable no-unused-expressions */
/* eslint-disable jest/prefer-expect-assertions */
const chai = require('chai');

const { expect } = chai;
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

describe('redisClient', () => {
  describe('#isAlive()', () => {
    it('should return true if the client is connected', () => {
      expect(redisClient.isAlive()).to.be.true;
    });
  });

  describe('#get()', () => {
    it('should return null for keys that do not exist', async () => {
      const value = await redisClient.get('nonexistentKey');
      expect(value).to.be.null;
    });
  });

  describe('#set() and #get()', () => {
    it('should set the value correctly and retrieve it', async () => {
      await redisClient.set('testKey', 'testValue', 60);
      const value = await redisClient.get('testKey');
      expect(value).to.equal('testValue');
    });
  });

  describe('#del()', () => {
    it('should delete the key-value pair correctly', async () => {
      await redisClient.set('testKey', 'testValue', 60);
      await redisClient.del('testKey');
      const value = await redisClient.get('testKey');
      expect(value).to.be.null;
    });
  });
});

describe('DBClient', () => {
  describe('#isAlive()', () => {
    it('should return true if the client is connected', () => {
      expect(dbClient.isAlive()).to.be.true;
    });
  });

  describe('#nbUsers()', () => {
    it('should return a number', async () => {
      const nbUsers = await dbClient.nbUsers();
      expect(nbUsers).to.be.a('number');
    });
  });

  describe('#nbFiles()', () => {
    it('should return a number', async () => {
      const nbFiles = await dbClient.nbFiles();
      expect(nbFiles).to.be.a('number');
    });
  });
});
