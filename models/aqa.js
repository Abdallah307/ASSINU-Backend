const mongoose = require('mongoose')
const {Schema} = mongoose

const askSchema = new Schema({
    content: {
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
    recipient: {
        type: Schema.Types.ObjectId,
        ref:'Student'
    },
    isAnswered:{
        type:Schema.Types.Boolean,
        default:false
    }
}, {
    timestamps:true
})

module.exports = mongoose.model('ask',askSchema)


