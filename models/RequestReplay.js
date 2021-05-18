const mongoose = require('mongoose');
const {Schema} = mongoose 

const requestReplaySchema = new Schema ({
    sender : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    request : {
        type : Schema.Types.ObjectId,
        ref : ''
    }
})