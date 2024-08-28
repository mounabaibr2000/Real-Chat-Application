const express = require('express');
const { sendMessage, getMessages } = require('../controllers/message.controllers');
const { sendMessageRules, validate } = require('../middleware/validateFields');
const auth = require('../middleware/auth.middleware');

const router = express.Router();



 router.get('/messages/:chatRoomId', auth, getMessages);

 

router.post('/messages', auth, sendMessageRules, validate, sendMessage);
router.get('/history', auth,getMessages);

module.exports = router;
