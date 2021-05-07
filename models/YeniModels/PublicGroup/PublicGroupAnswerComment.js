const mongoose = require('mongoose');
const { Schema } = mongoose

const answerCommentSchema = new Schema({
    owner: {
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    answer: {
        type:Schema.Types.ObjectId,
        ref:'PublicGroupAnswer'
    },
    content: Schema.Types.String,
})

module.exports = mongoose.model('PublicGroupAnswerComment', answerCommentSchema)