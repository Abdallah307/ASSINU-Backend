const onlineUsers = []

exports.sIO = (io) => {

    io.on('connection', socket => {
        const userId = socket.handshake.query.userId
        onlineUsers.push({
            userId : userId,
            socketId : socket.id 
        })
        console.log('Client connected')
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


    })

    

}