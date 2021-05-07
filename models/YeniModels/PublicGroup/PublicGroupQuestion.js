const mongoose = require('mongoose');
const { Schema } = mongoose

const publicGroupQuestionSchema = new Schema({
    content: {
        type: Schema.Types.String,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref:'User'
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
    type : {
        type: Schema.Types.String,
        default : 'question'
    }
    
}, {
    timestamps:true
})

publicGroupQuestionSchema.index({content:'text'})

module.exports = mongoose.model('PublicGroupQuestion', publicGroupQuestionSchema)

