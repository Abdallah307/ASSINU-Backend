exports.sIO = (io) => {

    io.on('connection', socket => {

        socket.on('typingEventG', ({ value, groupId, username }) => {
            if (value.length !== 0) {
                io.emit('tttG', {
                    groupId: groupId,
                    username: username
                })
            }
            else {
                io.emit('stoppedTypingG', {
                    groupId: groupId
                })
            }

        })

        socket.on('typingEventP', ({ value, senderId, receiverId, username }) => {
            if (value.length !== 0) {
                io.emit('tttP', {
                    senderId: senderId,
                    receiverId:receiverId,
                    username: username
                })
            }
            else {
                io.emit('stoppedTypingP', {
                    senderId: senderId,
                    receiverId:receiverId,
                })
            }

        })
        console.log('Client connected')
    })

}