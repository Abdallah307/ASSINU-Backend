const mongoose = require('mongoose');
const { Schema } = mongoose

const publicGroupAnswerSchema = new Schema({
    
    content: Schema.Types.String,

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    question: {
        type:Schema.Types.ObjectId,
        ref:'PublicGroupQuestion'
    },

    numberOfUpvotes: {
        type:Schema.Types.Number,
        default:0,
    },

    numberOfDownvotes:{
        type:Schema.Types.Number,
        default:0
    },

    createdAt: Schema.Types.Date,

    bestAnswer: Schema.Types.Boolean,

    upvoters: {
        type: Schema.Types.Array,
        default: []
    },

    downvoters: {
        type: Schema.Types.Array,
        default: []
    },
    numberOfComments : {
        type: Schema.Types.Number,
        default : 0,
    }
}, {
    timestamps : true
})

module.exports = mongoose.model('PublicGroupAnswer', publicGroupAnswerSchema)