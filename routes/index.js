const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');

const router = express.Router();

router.route('/status').get(AppController.getStatus);
// router.route('/stats').get(AppController.getStats);
// router.post('/users').post(UsersController.postNew);
// router.route('/connect').get(AuthController.getConnect);
// router.route('/disconnect').get(AuthController.getDisconnect);
// router.route('/users/me').get(UsersController.getMe);

module.exports = router;
