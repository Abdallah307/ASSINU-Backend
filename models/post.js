const mongoose = require('mongoose');
const { Schema } = mongoose

const postSchema = new Schema({
    content: {
        type: Schema.Types.String,
        required: true,
    },
    groupId: {
        type: Schema.Types.ObjectId,
    },
    ownerId: {
        type: Schema.Types.ObjectId,
    },
    likes: {
        types: Schema.Types.Array
    },
    comments: [
        {
            content: Schema.Types.String,
            ownerId: Schema.Types.ObjectId,
            createdAt: new Date()
        }
    ],
}, {
    timestamps:{
        createdAt,
        updatedAt
    }
})

module.exports = mongoose.model('Post', postSchema)
