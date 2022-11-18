const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');

const router = express.Router();

router.route('/status').get(AppController.getStatus);
router.route('/stats').get(AppController.getStats);
router.post('/users', UsersController.postNew);


module.exports = router;
