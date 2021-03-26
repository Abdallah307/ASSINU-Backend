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
    answers: [
        {
            content: Schema.Types.String,
            ownerId: {
                type: Schema.Types.ObjectId,
                ref:"Student"
            },
            votes: Schema.Types.Number,
            createdAt: Schema.Types.Date,
            bestAnswer: Schema.Types.Boolean
        }
    ],
    followers: [
        {
            followerId: {
                type: Schema.Types.ObjectId,
                ref:"Student"
            }
        }
    ]
    
}, {
    timestamps:true
})

module.exports = mongoose.model('UniversityQuestion', questionSchema)
