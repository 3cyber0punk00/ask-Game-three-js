const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const gameController = require('../../controllers/threejs.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.put('/latest/action', gameController.updateAction);
router.get('/latest/action', gameController.getLatestAction);

module.exports = router;