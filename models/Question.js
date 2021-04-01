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
            bestAnswer: Schema.Types.Boolean,
            upvoters:  {
                type: Schema.Types.Array,
                default:[]
            },
            downvoters: {
                type: Schema.Types.Array,
                default:[]
            },
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

questionSchema.index({content:'text'})

module.exports = mongoose.model('UniversityQuestion', questionSchema)

