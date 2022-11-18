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
        
        const userVar = await Mongo.users.insertOne({
            email,
            passsword: sha1(password)
        })
        return response.status(201).json({id: userVar.insertedId, email});
    }
}

module.exports = UsersController;
