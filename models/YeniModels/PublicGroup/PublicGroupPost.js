const mongoose = require('mongoose');
const { Schema } = mongoose


const publicGroupPostsSchema = new Schema({
    content:{
        type: Schema.Types.String,
        required : true,
    },
    imageUrl: {
        type: Schema.Types.String,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref:'User'
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
})

module.exports = mongoose.model('PublicGroupPost', publicGroupPostsSchema)