const User = require("../models/User");
const errorCreator = require("../errorCreator");
const axios = require("axios");

exports.getStudentsDepartmentGroupMembers = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    let members = [];
    const response = await axios.get(
      `http://localhost:9002/api/department/${departmentId}/students/members`
    );

    if (response.status === 200) {
      //console.log(response.data.members)
      for (let i = 0; i < response.data.members.length; i++) {
        const newMember = await User.findOne({
          email: response.data.members[i].email,
        }).select("name imageUrl myAsk");
        if (newMember) {
          members.push(newMember);
        }

        if (i == response.data.members.length - 1) {
          return res.status(200).json({
            members: members,
          });
        }
      }
    }
  } catch (err) {
    return next(err);
  }
};

exports.getAllStudents = async (req, res, next) => {
  try {
    const response = await axios.get(`http://localhost:9002/api/allstudents`);
    let students = [];
    if (response.status === 200) {
      for (let i = 0; i < response.data.students.length; i++) {
        const student = await User.findOne({
          email: response.data.students[i].email,
        }).select("name imageUrl myAsk");
        if (student) {
          students.push(student);
        }

        if (i == response.data.students.length - 1) {
          return res.status(200).json({
            members: students,
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getDepartmentAllMembers = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const response = await axios.get(
      `http://localhost:9002/api/department/${departmentId}/all/members`
    );
    let members = [];
    if (response.status === 200) {
      for (let i = 0; i < response.data.members.length; i++) {
        const member = await User.findOne({
          email: response.data.members[i].email,
        })
        .select('name imageUrl myAsk')

        if (member) {
            members.push(member)
        }

        if (i == response.data.members.length - 1) {
            return res.status(200).json({
                members : members 
            })
        }
      }
    }
  } catch (err) {
    return next(err);
  }
};
