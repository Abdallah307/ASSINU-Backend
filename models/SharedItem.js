const mongoose = require('mongoose');
const { Schema } = mongoose


const sharedItemSchema = new Schema({
    name:{
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
    ownerId: {
        type:Schema.Types.ObjectId,
        required:true
    },
    departmentId: {
        type:Schema.Types.ObjectId,
    }
})

sharedItemSchema.index({name:'text'})

exports.PublicSharedItem = mongoose.model('PublicSharedItem', sharedItemSchema)
exports.DepartmentSharedItem = mongoose.model('DepartmentSharedItem', sharedItemSchema)