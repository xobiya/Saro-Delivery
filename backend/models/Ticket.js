const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Delivery'
    },
    subject: {
        type: String,
        required: true
    },
    messages: [{
        sender: { type: String, enum: ['user', 'admin'], required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    status: {
        type: String,
        enum: ['open', 'pending', 'resolved'],
        default: 'open'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);
