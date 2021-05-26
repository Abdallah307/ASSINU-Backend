const mongoose = require('mongoose');
const {Schema} = mongoose

const userSchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true,
    },
    email: {
        type: Schema.Types.String,
        required: true
    },
    password: {
        type: Schema.Types.String,
        required: true,
    },
    imageUrl: {
        type: Schema.Types.String,
        default: ''
    },
    token: {
        type: Schema.Types.String,
        default: '',
    },
    userType: {
        type:Schema.Types.String,
        required: true
    },
    notifications : {
        type : Schema.Types.Boolean,
        required : true,
        default : true
    },
    myAsk : {
        type : Schema.Types.Boolean,
        required : true,
        default : true
    }
})

userSchema.index({name:'text'})

module.exports = mongoose.model('User', userSchema)