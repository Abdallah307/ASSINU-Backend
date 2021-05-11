const mongoose = require('mongoose');
const { Schema } = mongoose


const postCommentSchema = new Schema({
    content:{
        type: Schema.Types.String,
        required : true,
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'DepartmentGroupPost'
    },
    imageUrl: {
        type: Schema.Types.String,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    numberOfReplays : {
        type : Schema.Types.Number ,
        default  : 0
    }
}, {
    timestamps : true 
})

module.exports = mongoose.model('DepartmentGroupPostComment', postCommentSchema)