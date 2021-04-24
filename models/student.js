const mongoose = require('mongoose');
const { Schema } = mongoose

const studentSchema = new Schema({
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
    bio: {
        type: Schema.Types.String,
        default: ''
    },
    token: {
        type: Schema.Types.String,
        default: '',
    },
    connections:{
        type:Schema.Types.Array,
        default:[]
    }
})

studentSchema.index({ name: 'text' })

module.exports = mongoose.model('Student', studentSchema)