const express = require('express');
const { saveMessage, getChatHistory, getUserChats ,ingestRepo} = require('../controllers/chatController.js');
const verifyToken = require('../middleware/authMiddleware.js'); // You need to create this!

const router = express.Router();
router.post('/save', verifyToken, saveMessage);
router.get('/history', verifyToken, getChatHistory);
router.post('/ingest', verifyToken, ingestRepo);
router.get('/user-chats', verifyToken, getUserChats); // New route
module.exports = router;