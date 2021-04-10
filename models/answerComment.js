const mongoose = require('mongoose');
const { Schema } = mongoose

const answerCommentSchema = new Schema({
    ownerId: {
        type:Schema.Types.ObjectId,
        ref:'Student'
    },
    answerId: {
        type:Schema.Types.ObjectId,
        ref:'Answer'
    },
    content: Schema.Types.String,
    replays: [
        {
            ownerId: {
                type:Schema.Types.ObjectId,
                ref:'Student'
            },
            content:Schema.Types.String,
        }
    ]
})

module.exports = mongoose.model('AnswerCommment', answerCommentSchema)