const express = require('express');
const router = express.Router();
const controller = require("../controllers/controller");
const auth = require("../middleware/auth");

router.post('/register', controller.registerUser);
router.post('/login', auth, controller.loginUser);
router.get('/logout', auth, controller.logout);

router.post('/createOrder', auth, controller.createOrder);
router.delete('/cancelOrder/:id', auth, controller.cancelOrder);

module.exports = router;
