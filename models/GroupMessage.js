const mongoose = require('mongoose');
const {Schema} = mongoose

const groupMessageSchema = new Schema({
    content: {
        type:Schema.Types.String,
        required: true,
    },
    ownerId: {
        type:Schema.Types.ObjectId,
        ref: "Student",
    },
    groupId: {
        type: Schema.Types.ObjectId,
    }
})

module.exports = mongoose.model('GroupMessage', groupMessageSchema)