const mongoose = require('mongoose');
const { Schema } = mongoose

const postSchema = new Schema({
    content: {
        type: Schema.Types.String,
        required: true,
    },
    imageUrl: {
        type: Schema.Types.String,
    },
    groupId: {
        type: Schema.Types.ObjectId,
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    likes: {
        type: Schema.Types.Array
    },
    comments: [
        {
            content: Schema.Types.String,
            ownerId: {
                type: Schema.Types.ObjectId,
                ref:"User"
            },
            createdAt: Schema.Types.Date,
        }
    ],
    type : {
        type:Schema.Types.String,
        default:'post'
    }
    
}, {
    timestamps:true
})

module.exports = mongoose.model('Post', postSchema)
