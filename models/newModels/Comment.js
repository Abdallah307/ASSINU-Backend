const mongoose = require('mongoose');
const {Schema} = mongoose

const commentSchema = new Schema({
    content : {
        type : Schema.Types.String,
        required: true
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    referedTo : {
        type : Schema.Types.ObjectId,
        ref : 'Post'
    },
    numberOfReplays : {
        type : Schema.Types.Number,
        default : 0
    },
    imageUrl : {
        type : Schema.Types.String,
    }
},{
    timestamps : true 
})

module.exports = mongoose.model('Comment', commentSchema)