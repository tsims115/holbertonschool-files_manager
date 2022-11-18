const Redis = require('../utils/redis');
const Mongo = require('../utils/mongodb');
const sha1 = require('../utils/sha1');
const mongodb = require('mongodb');

class UsersController {
    postNew(request, response) {
        const {email, password } = request.body;
        if (!email) {
            response.status(400).json({error: 'Missing email'});
        }
        if (!password) {
			response.status(400).json({error: 'Missing password'});
		}
    }
}

module.exports = UsersController;
