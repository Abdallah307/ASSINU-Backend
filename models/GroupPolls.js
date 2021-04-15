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
    choices:[
        {
            numberOfVotes:Schema.Types.Number,
            choiceContent:Schema.Types.String 
        }
    ],
    voters:[
        {
            voterId: {
                type:Schema.Types.ObjectId,
                ref:'Student'
            },
            choiceId:Schema.Types.ObjectId
        }
    ],
}, {
    timestamps:true
})

module.exports = mongoose.model('GroupPoll', pollSchema)
