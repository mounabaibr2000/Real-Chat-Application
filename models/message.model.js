const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function() {
            return !this.chatRoomId;  // receiverId is required only if chatRoomId is not present
        }
    },
    chatRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: function() {
            return !this.receiverId;  // chatRoomId is required only if receiverId is not present
        }
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
