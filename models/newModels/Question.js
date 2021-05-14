const mongoose = require('mongoose');
const {Schema} = mongoose

const questionSchema = new Schema({
    content: {
        type: Schema.Types.String,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    imageUrl : {
        type : Schema.Types.String,
        defautl : ''
    },
    followers: {
        type : Schema.Types.Array,
        default : []
    },
    numberOfAnswers:{
        type:Schema.Types.Number,
        default:0,
    },
    numberOfFollowers : {
        type: Schema.Types.Number,
        default:0
    },
    groupId : {
        type: Schema.Types.ObjectId,
        required : true
    },
    type : {
        type: Schema.Types.String,
        default : 'question'
    }
}, {
    timestamps : true
})

module.exports = mongoose.model('Question', questionSchema)