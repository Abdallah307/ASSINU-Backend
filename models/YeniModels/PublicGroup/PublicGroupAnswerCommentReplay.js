const mongoose = require('mongoose');
const { Schema } = mongoose

const replaySchema = new Schema({
    owner: {
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    content:{
        type:Schema.Types.String,
        required:true
    },
    comment: {
        type:Schema.Types.ObjectId,
        ref:'PublicGroupAnswerComment'
    }
})

module.exports = mongoose.model('PublicGroupAnswerCommentReplay', replaySchema)