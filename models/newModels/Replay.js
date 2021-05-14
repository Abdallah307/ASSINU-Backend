const mongoose = require('mongoose');
const {Schema} = mongoose

const replaySchema = new Schema({
    content : {
        type : Schema.Types.String,
        required: true
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    referedTo : {
        type : Schema.Types.ObjectId,
    },
    imageUrl : {
        type : Schema.Types.String,
    }
}, {
    timestamps : true 
})

module.exports = mongoose.model('Replay', replaySchema)