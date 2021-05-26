const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const errorCreator = require("../errorCreator");
const axios = require("axios");

exports.signUp = async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword

    if (!name || !email || !password || !confirmPassword) {
        throw errorCreator('Please fill the required fields', 422)
    }


    const emailDomainPart = email.split("@")[1];
    if (
      emailDomainPart !== "stu.najah.edu" &&
      emailDomainPart !== "najah.edu"
    ) {
        throw errorCreator("Please use your university email", 422);
    }



    if (await checkExistingEmail(email)) {
      throw errorCreator('Email is Already registerd!', 422)
    }

    if (password !== confirmPassword) {
        throw errorCreator('passwords are not identical', 403)
    }



    const userType = getUserType(email);

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      userType: userType,
      imageUrl : 'images/no-image.png'
    });

    await user.save();
    return res.status(201).json({
      message: "Signed up successfully",
    });
  } catch (err) {
    return next(err);
  }
};

const checkExistingEmail = async (email) => {
  const user = await User.findOne({ email: email });
  if (!user) return false;
  return true;
};

const getUserType = (email) => {
  const emailDomain = email.split("@")[1];
  if (emailDomain === "najah.edu") return "teacher";
  else if (emailDomain === "stu.najah.edu") return "student";
};

exports.signIn = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      throw errorCreator("Please fill the required fields", 422);
    }
    const emailDomainPart = email.split("@")[1];
    if (
      emailDomainPart !== "stu.najah.edu" &&
      emailDomainPart !== "najah.edu"
    ) {
        throw errorCreator("Please use your university email", 422);
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      throw errorCreator("This Email is not registered", 422);
    }
    const userPassword = user.password;

    const isPasswordOk = await bcrypt.compare(password, userPassword);

    if (!isPasswordOk) {
      throw errorCreator('password is not correct', 403)
    }

    const token = createToken(user);
    user.token = token;

    await user.save();

    if (user.userType === "teacher") {
      const response = await axios.get(
        `http://localhost:9002/teacher/info/${user.email}`
      );
      if (response.status === 200) {
        const resul = await axios.get(
          `http://localhost:9002/student/departmentgroup/${response.data.departmentId._id}`
        );

        return res.status(200).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          imageUrl: user.imageUrl,
          token: user.token,
          courses: response.data.courses,
          departmentName: response.data.departmentId.name,
          departmentId: response.data.departmentId._id,
          userType: user.userType,
          numberOfMembers: resul.data.numberOfMembers,
          notifications: user.notifications,
          myAsk: user.myAsk,
        });
      }
    } else if (user.userType === "student") {
      const response = await axios.get(
        `http://localhost:9002/student/info/${user.email}`
      );
      if (response.status === 200) {
        const resul = await axios.get(
          `http://localhost:9002/student/departmentgroup/${response.data.departmentId._id}`
        );

        return res.status(200).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          imageUrl: user.imageUrl,
          token: user.token,
          courses: response.data.courses,
          departmentName: response.data.departmentId.name,
          departmentId: response.data.departmentId._id,
          userType: user.userType,
          numberOfMembers: resul.data.numberOfMembers,
          notifications: user.notifications,
          myAsk: user.myAsk,
        });
      }
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
      token: user.token,
    });
  } catch (err) {
    return next(err);
  }
};

exports.signOut = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "Error No User found",
      });
    }

    user.token = "";

    await user.save();

    req.userId = null;

    res.status(200).json({
      message: "Signed out successfully",
    });
  } catch (err) {
    console.log(err);
  }
};

const createToken = (user) => {
  const token = jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
    },
    "iamabdallahdereiaiamacomputerengineer"
  );

  return token;
};
