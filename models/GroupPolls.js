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
        ref:'User'
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
                ref:'User'
            },
            choiceId:Schema.Types.ObjectId
        }
    ],
    type: {
        type:Schema.Types.String,
        default:'poll'
    },
    isMultipleChoice: {
        type: Schema.Types.Boolean,
        default:false
    }
}, {
    timestamps:true
})

module.exports = mongoose.model('GroupPoll', pollSchema)
