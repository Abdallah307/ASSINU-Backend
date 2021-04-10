const mongoose = require('mongoose');
const { Schema } = mongoose

const questionSchema = new Schema({
    content: {
        type: Schema.Types.String,
        required: true,
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref:'Student'
       
    },
    followers: [
        {
            followerId: {
                type: Schema.Types.ObjectId,
                ref:"Student"
            }
        }
    ],
    numberOfAnswers:{
        type:Schema.Types.Number,
        default:0,
    }
    
}, {
    timestamps:true
})

questionSchema.index({content:'text'})

module.exports = mongoose.model('UniversityQuestion', questionSchema)

