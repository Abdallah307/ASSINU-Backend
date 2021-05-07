const mongoose = require('mongoose');
const { Schema } = mongoose

const departmentGroupAnswerSchema = new Schema({
    
    content: Schema.Types.String,

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    question: {
        type:Schema.Types.ObjectId,
        ref:'DepartmentGroupQuestion'
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
        type : Schema.Types.Array,
        default : []
    },

    downvoters: {
        type : Schema.Types.Array,
        default : []
    },
    numberOfComments : {
        type: Schema.Types.Number,
        default : 0,
    }
})

module.exports = mongoose.model('DepartmentGroupAnswer', departmentGroupAnswerSchema)