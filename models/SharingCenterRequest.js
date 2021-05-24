const mongoose = require('mongoose');
const {Schema} = mongoose 

const sharingCenterRequestSchema = new Schema({
    sender : {
        type : Schema.Types.ObjectId,
        ref : 'User' 
    },
    receiver : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    sharedItem : {
        type : Schema.Types.ObjectId,
        ref : 'SharedItem'
    },
    message : {
        type : Schema.Types.String,
        required : true 
    }
}, {
    timestamps : true 
})

module.exports = mongoose.model('SharingCenterRequest', sharingCenterRequestSchema)