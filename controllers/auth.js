const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const errorCreator = require("../errorCreator");
const axios = require("axios");
const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");

const trasporter = nodemailer.createTransport(
  sendGridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

exports.resendVerificationCode = async (req, res, next) => {
  try {
    const {email} = req.body 
    const user = await User.findOne({email : email})

    if (!user) {
      throw errorCreator('User not found', 404)
    }

    const newVerificationCode = generateVerificationCode()

    user.verificationCode = newVerificationCode
    await user.save()

    trasporter.sendMail({
      to : email,
      from : 'a.dereia@stu.najah.edu',
      subject : 'Please verify your email in ASSINU',
      sender : 'a.dereia@stu.najah.edu',
      html : '<h1>Your verification code is '+newVerificationCode+'</h1>'
    })
    .then(result => {
      console.log('sent successfully')
      return res.status(201).json({
        message : 'generated new verifiaction code'
      })
    })
    .catch((err) => {
      console.log(err)
    })


  }
  catch(err) {
    return next (err)
  }
}

exports.checkVerificationCode = async (req, res, next) => {
  try {
    const {code, email} = req.body 
    const user = await User.findOne({email : email})
    console.log(email)
    if (!user) {
      throw errorCreator('User not found', 404)
    }

    if (user.verificationCode.toString() === code.toString()) {

      user.verificationCode = undefined
      user.expires_at = undefined
      await user.save()

      return res.status(200).json({
        message : "Email Verified Successfully"
      })
    }

    throw errorCreator('Verification code is not correct', 422)

  }
  catch(err){
    return next (err)
  }
}

exports.signUp = async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (!name || !email || !password || !confirmPassword) {
      throw errorCreator("Please fill the required fields", 422);
    }

    const emailDomainPart = email.split("@")[1];
    if (
      emailDomainPart !== "stu.najah.edu" &&
      emailDomainPart !== "najah.edu"
    ) {
      throw errorCreator("Please use your university email", 422);
    }

    if (await checkExistingEmail(email)) {
      throw errorCreator("Email is Already registerd!", 422);
    }

    if (password !== confirmPassword) {
      throw errorCreator("passwords are not identical", 403);
    }

    const verificationCode = generateVerificationCode()

    const userType = getUserType(email);

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      userType: userType,
      imageUrl: "images/no-image.png",
      verificationCode : verificationCode
    });

    await user.save();

    trasporter.sendMail({
      to : email,
      from : 'a.dereia@stu.najah.edu',
      subject : 'Please verify your email in ASSINU',
      sender : 'a.dereia@stu.najah.edu',
      html : '<h1>Your verification code is '+verificationCode+'</h1>'
    })
    .then(result => {
      console.log('sent successfully')
      return res.status(201).json({
        message: "Signed up successfully",
      });
    })
    .catch((err) => {
      console.log(err)
    })

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

    if (user.verificationCode) {
      throw errorCreator('Please Verifiy your email', 401)
    }

    const userPassword = user.password;

    const isPasswordOk = await bcrypt.compare(password, userPassword);

    if (!isPasswordOk) {
      throw errorCreator("password is not correct", 403);
    }

    const token = createToken(user);
    user.token = token;

    await user.save();

    // trasporter.sendMail({
    //   to : email,
    //   from : 'a.dereia@stu.najah.edu',
    //   subject : 'Signup Succeded',
    //   sender : 'a.dereia@stu.najah.edu',
    //   html : '<h1>Abdallah trying email address</h1>'
    // })
    // .catch((err) => {
    //   console.log(err)
    // })

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

exports.sendForgetPasswordCode = async (req, res, next) => {
  try {
    const {email} = req.body 

    const user = await User.findOne({email : email})

    if (!user) {
      throw errorCreator('User not found', 404)
    }

    const verificationCode = generateVerificationCode()

    user.resetCode = verificationCode

    await user.save()

    res.status(200).json({
      message : 'check your email'
    })

    await trasporter.sendMail({
      to : email,
      from : 'a.dereia@stu.najah.edu',
      subject : 'Forgotten your ASSINU password? No worries -- it happens!',
      sender : 'a.dereia@stu.najah.edu',
      html : '<h1>Your reset code is '+verificationCode+'</h1>'
    })

    

  }
  catch(err) {
    return next (err)
  }
}

exports.checkForgetPasswordCode = async (req, res, next) => {
  try {
    const {code, email} = req.body
    
    const user = await User.findOne({email : email})

    if (!user) {
      throw errorCreator('User not found', 404)
    }

    if (!user.resetCode) {
      throw errorCreator('Error reseting password', 500)
    }

    if (user.resetCode.toString() === code.toString()) {
      const resetToken = createToken(user)
      user.resetToken = resetToken
      await user.save()
      return res.status(200).json({
        token : resetToken
      })
    }

    throw errorCreator('Verification code is not correct', 401)

  }
  catch(err) {
    return next (err)
  }
}


exports.setNewPassword = async (req, res, next) => {
  try {
    const {newPassword, confirmNewPassword, email, token} = req.body
    
    
    const user = await User.findOne({email : email})

    if (!user) {
      throw errorCreator('User not found', 404)
    }

    if (!newPassword || !confirmNewPassword) {
      throw errorCreator('Please fill in the required fields')
    }

    if (newPassword !== confirmNewPassword) {
      throw errorCreator('Passwords are not identical')
    }

    if (token.toString() !== user.resetToken.toString()) {
      throw errorCreator('Not Authenticated', 401)
    }



    const hashedPassword = await bcrypt.hash(newPassword, 12)

    user.password = hashedPassword
    user.resetToken = undefined 
    user.resetCode = undefined
    await user.save()

    return res.status(201).json({
      message : 'Changed Password successfully'
    })

  }
  catch(err) {
    return next (err)
  }
}

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

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
}
