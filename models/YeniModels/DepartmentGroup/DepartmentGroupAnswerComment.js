const mongoose = require('mongoose');
const { Schema } = mongoose

const answerCommentSchema = new Schema({
    owner: {
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    answer: {
        type:Schema.Types.ObjectId,
        ref:'DepartmentGroupAnswer'
    },
    content: Schema.Types.String,
})

module.exports = mongoose.model('DepartmentGroupAnswerComment', answerCommentSchema)