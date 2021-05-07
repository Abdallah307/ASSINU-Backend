const mongoose = require('mongoose');
const { Schema } = mongoose

const postCommentReplaySchema = new Schema({
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
        ref:'DepartmentGroupPostComment'
    }
})

module.exports = mongoose.model('DepartmentGroupPostCommentReplay', postCommentReplaySchema)