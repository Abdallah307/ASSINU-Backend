const mongoose = require('mongoose')
const {Schema} = mongoose

const askQuestionSchema = new Schema({
    question: {
        type:Schema.Types.String,
        required:true,
    },
    answer:{
        type:Schema.Types.String,
        default:''
    },
    sender: {
        type:Schema.Types.ObjectId,
        ref:'Student'
    },
    receiver: {
        type:Schema.Types.ObjectId,
        ref:'Student'
    },
    isAnswered:{
        type:Schema.Types.Boolean,
        default:false
    }
}, {
    timestamps:true
})

module.exports = mongoose.model('AskQuestion', askQuestionSchema)


