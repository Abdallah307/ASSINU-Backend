const mongoose = require('mongoose');
const {Schema} = mongoose 

const requestReplaySchema = new Schema ({
    content : {
        type : Schema.Types.String,
        required : true 
    },
    sender : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    request : {
        type : Schema.Types.ObjectId,
        ref : 'SharingCenterRequest'
    }
}, {
    timestamps : true 
})

module.exports = mongoose.model('RequestReplay', requestReplaySchema)