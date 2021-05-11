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
    numberOfReplays : {
        type : Schema.Types.Number,
        default : 0
    },
    content: Schema.Types.String,
}, {
    timestamps : true
})

module.exports = mongoose.model('DepartmentGroupAnswerComment', answerCommentSchema)