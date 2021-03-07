const Student = require('../models/student');

exports.getStudentInfo = async (req, res, next) => {
    const student = await Student.findById(req.userId)
    
    if (!student) {
        return res.status(401).json({
            message: "student not found in the database"
        })
    }

    return res.status(200).json({
        name: student.name,
        imageUrl:student.imageUrl,
        bio:student.bio 
    })
}