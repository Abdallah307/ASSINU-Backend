const mongoose = require('mongoose');
const {Schema} = mongoose 

const sharingCenterRequestSchema = new Schema({
    sender : {
        type : Schema.Types.ObjectId,
        required : true 
    },
    receiver : {
        type : Schema.Types.ObjectId,
        required : true 
    },
    sharedItem : {
        type : Schema.Types.ObjectId,
        ref : ''
    },
    message : {
        type : Schema.Types.String,
        required : true 
    }
})