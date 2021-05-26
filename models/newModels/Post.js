const mongoose = require('mongoose');
const {Schema} = mongoose

const postSchema = new Schema({
    content : {
        type : Schema.Types.String,
        required : true 
    },
    imageUrl: {
        type: Schema.Types.String,
    },
    groupId: {
        type: Schema.Types.ObjectId,
        required : true
    },
    groupType : {
        type : Schema.Types.String,
        required: true 
    },
    groupName : {
        type : Schema.Types.String,
        required : true 
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    likes: {
        type: Schema.Types.Array
    },
    type: {
        type:Schema.Types.String,
        required: true,
        default: 'post'
    },
    numberOfLikes : {
        type: Schema.Types.Number,
        default : 0
    },
    numberOfComments: {
        type: Schema.Types.Number,
        default: 0
    }
}, {
    timestamps : true
})

module.exports = mongoose.model('Post', postSchema)