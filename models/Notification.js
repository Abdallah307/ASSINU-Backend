const mongoose = require('mongoose');
const {Schema} = mongoose 

const notificationSchema = new Schema({
    To : [
        {
            member : {
                type : Schema.Types.ObjectId,
                ref : 'User'
            }
        }
    ],
    NotificationType : {
        type : Schema.Types.String,
        required : true
    },
    content : {
        type : Schema.Types.String,
        required : true 
    },
    payload : {
        
    },
})

module.exports = mongoose.model('Notifications', notificationSchema)