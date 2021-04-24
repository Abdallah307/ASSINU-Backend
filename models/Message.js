const mongoose = require('mongoose');
const {Schema} = mongoose

const messageSchema = new Schema({
    content: {
        type:Schema.Types.String,
        required: true,
    },
    sender: {
        type:Schema.Types.ObjectId,
        ref: "Student",
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref:'Student'
    }
    
}, {
    timestamps:true
})

module.exports = mongoose.model('Message', messageSchema)