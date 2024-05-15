/* eslint-disable jest/valid-expect */
/* eslint-disable no-unused-expressions */
/* eslint-disable jest/prefer-expect-assertions */
/* eslint-disable jest/no-hooks */
const chai = require('chai');
const sinon = require('sinon');

const { expect } = chai;
const FileController = require('../controllers/FilesController');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

describe('fileController', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('#postUpload', () => {
    it('should return 401 Unauthorized if no X-Token is provided', async () => {
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      await FileController.postUpload({}, res);
      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({ error: 'Unauthorized' })).to.be.true;
    });

    it('should return 401 Unauthorized if user ID is not found in Redis', async () => {
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      sinon.stub(redisClient, 'get').resolves(null);
      await FileController.postUpload({ headers: { 'X-Token': 'someToken' } }, res);
      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({ error: 'Unauthorized' })).to.be.true;
    });

    it('should return 400 Bad Request if name is missing', async () => {
      const req = {
        body: {},
        headers: {
          'X-Token': 'valid-token'
        }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await FileController.postUpload(req, res);

      expect(res.status.calledOnceWith(400)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.equal({ error: 'Missing name' });
    });

    it('should return 400 Bad Request if type is invalid', async () => {
      const req = {
        body: {
          name: 'Invalid Type',
          type: 'invalidType',
          data: 'SGVsbG8gd29ybGQ='
        },
        headers: {
          'X-Token': 'valid-token'
        }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      await FileController.postUpload(req, res);

      expect(res.status.calledOnceWith(400)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.equal({ error: 'Missing type' });
    });

    it('should return 400 Bad Request if parent folder is not found', async () => {
      const req = {
        body: {
          name: 'Child Folder',
          type: 'folder',
          parentId: '99999',
        headers: {
          'X-Token': 'valid-token'
        }
      };

    const req = {
        body: {
            name: 'Child Folder',
            type: 'folder',
            parentId: '99999',
        },
        headers: {
            'X-Token': 'valid-token'
        }
    };
    const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
    };

    await FileController.postUpload(req, res);

    expect(res.status.calledOnceWith(400)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal({ error: 'Parent not found' });
    });
  });
});
