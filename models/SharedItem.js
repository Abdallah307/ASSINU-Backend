const mongoose = require('mongoose');
const { Schema } = mongoose


const sharedItemSchema = new Schema({
    title:{
        type:Schema.Types.String,
        required:true,
    },
    imageUrl:{
        type:Schema.Types.String,
        required:true,
    },
    details: {
        type:Schema.Types.String,
        required:true,
    },
    owner: {
        type:Schema.Types.ObjectId,
        ref : 'User'
    },
    price : {
        type : Schema.Types.Number,
        default : 0
    },
    departmentId: {
        type:Schema.Types.ObjectId,
    },
    reserved : {
        type : Schema.Types.Boolean,
        default : false
    }

}, {
    timestamps : true 
})

sharedItemSchema.index({title:'text'})

module.exports = mongoose.model('SharedItem', sharedItemSchema)