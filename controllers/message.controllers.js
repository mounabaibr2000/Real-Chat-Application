const Message = require('../models/message.model');
const ChatRoom = require('../models/chatroom.model');

exports.sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, chatRoomId, content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Message content is required' });
        }

        let chatRoom;

        if (chatRoomId) {
            // Handle message for existing chat room
            chatRoom = await ChatRoom.findById(chatRoomId);
            if (!chatRoom) {
                return res.status(404).json({ error: 'Chat room not found' });
            }
        } else if (receiverId) {
            // Handle direct message
            chatRoom = await ChatRoom.findOne({
                users: { $all: [senderId, receiverId] },
                isGroupChat: false
            });

            if (!chatRoom) {
                // Create a new chat room if it doesn't exist
                chatRoom = new ChatRoom({
                    users: [senderId, receiverId],
                    isGroupChat: false
                });
                await chatRoom.save();
            }
        } else {
            return res.status(400).json({ error: 'Invalid request, missing required fields' });
        }

        // Create and save the message
        const message = new Message({
            senderID: senderId,
            receiverId: receiverId || null,  // Set to null if not a direct message
            chatRoomId: chatRoom._id,
            content
        });

        await message.save();
        res.status(201).json({ message: 'Message sent successfully', message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during sending message' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { senderId, withUserId, groupId, page = 1, pageSize = 10 } = req.query;

        let filter = {};
        if (groupId) {
            // Fetch messages for a group chat
            filter.chatRoomId = groupId;
        } else if (senderId && withUserId) {
            // Fetch direct messages between two users
            const chatRoom = await ChatRoom.findOne({
                users: { $all: [userId, withUserId] },
                isGroupChat: false
            });

            if (!chatRoom) {
                return res.status(404).json({ error: 'Chat room not found between users' });
            }

            filter.chatRoomId = chatRoom._id;
        } else {
            return res.status(400).json({ error: 'Invalid request, missing required fields' });
        }

        // Pagination logic
        const skip = (page - 1) * pageSize;

        // Fetch messages based on the filter and pagination
        const messages = await Message.find(filter)
            .populate('userId', 'username email')
            .populate('receiverId', 'username email')
            .sort({ createdAt: -1 })  // Sort messages by most recent
            .skip(skip)
            .limit(pageSize);

        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during fetching messages' });
    }
};
