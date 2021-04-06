const mongoose = require('mongoose');
const { Schema } = mongoose

const pollSchema = new Schema({
    content: {
        type: Schema.Types.String,
        required: true,
    },
    groupId: {
        type: Schema.Types.ObjectId,
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref:'Student'
    },
    choices: {
        types: Schema.Types.Array
    },
    comments: [
        {
            content: Schema.Types.String,
            ownerId: {
                type: Schema.Types.ObjectId,
                ref:"Student"
            },
            createdAt: Schema.Types.Date,
        }
    ],
    
}, {
    timestamps:true
})

module.exports = mongoose.model('Post', pollSchema)
