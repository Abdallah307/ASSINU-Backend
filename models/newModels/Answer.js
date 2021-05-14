const mongoose = require('mongoose');
const {Schema} = mongoose

const answerSchema = new Schema({
    content : {
        type : Schema.Types.String,
        required : true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    question: {
        type:Schema.Types.ObjectId,
        ref:'Question'
    },

    numberOfUpvotes: {
        type:Schema.Types.Number,
        default:0,
    },
    numberOfDownvotes:{
        type:Schema.Types.Number,
        default:0
    },
    bestAnswer : {
        type : Schema.Types.Boolean,
        default : false
    },
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

module.exports = mongoose.model('Answer', answerSchema)