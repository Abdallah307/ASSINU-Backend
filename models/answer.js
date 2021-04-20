const mongoose = require('mongoose');
const { Schema } = mongoose

const answerSchema = new Schema({
    content: Schema.Types.String,

    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "Student"
    },

    questionId: {
        type:Schema.Types.ObjectId,
        ref:'UniversityQuestion'
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
})

module.exports = mongoose.model('Answer', answerSchema)