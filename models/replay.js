const mongoose = require('mongoose');
const { Schema } = mongoose

const replaySchema = new Schema({
    ownerId: {
        type:Schema.Types.ObjectId,
        ref:'Student'
    },
    content:{
        type:Schema.Types.String,
        required:true
    },
    commentId: {
        type:Schema.Types.ObjectId,
        ref:'AnswerComment'
    }
})

module.exports = mongoose.model('Replay', replaySchema)