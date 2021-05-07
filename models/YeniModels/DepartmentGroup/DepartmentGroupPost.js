const mongoose = require('mongoose');
const { Schema } = mongoose


const departmentGroupPostsSchema = new Schema({
    content:{
        type: Schema.Types.String,
        required : true,
    },
    imageUrl: {
        type: Schema.Types.String,
        default : ''
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    likes: {
        type: Schema.Types.Array,
        default : []
    },
    type: {
        type:Schema.Types.String,
        required: true,
        default: 'post'
    },
    numberOfLikes : {
        type: Schema.Types.Number,
        default : 0
    },
    departmentId : {
        type: Schema.Types.ObjectId
    },
    numberOfComments: {
        type: Schema.Types.Number,
        default: 0
    }
})

module.exports = mongoose.model('DepartmentGroupPost', departmentGroupPostsSchema)