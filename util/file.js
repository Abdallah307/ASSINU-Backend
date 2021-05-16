const fs = require('fs')



exports.deleteFile = deleteFile = (filePath, error) => {
    
    fs.unlink(filePath, err => {
        if (err)
            error(err)
    })
}