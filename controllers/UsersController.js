const Redis = require('../utils/redis');
const Mongo = require('../utils/db');
const sha1 = require('sha1');
const mongodb = require('mongodb');

module.exports = {
    postNew: async (request, response) => {
        const {email, password } = request.body;
        if (!email) {
            response.status(400).json({error: 'Missing email'});
        }
        if (!password) {
			response.status(400).json({error: 'Missing password'});
		}
        if (Mongo.users.findOne()) {
            response.status(400).json({error: 'Already exist'});
        }
        const userVar = await Mongo.users.insertOne({
            email,
            passsword: sha1(password)
        })
        response.status(201).json({id: userVar.insertedId, email});
    }
}

