const User = require("../models/User");
const Message = require("../models/Message");
const errorCreator = require("../errorCreator");
const io = require("../socket");
const fileHelper = require("../util/file");
const Notification = require("../models/Notification");
const Post = require("../models/newModels/Post");
const Poll = require("../models/newModels/Poll");
const Question = require("../models/newModels/Question");
const { default: axios } = require("axios");

exports.getUserInfo = async (req, res, next) => {
  try {
    // if (!req.userId) {
    //     return res.status(403).json({
    //         message:'Please sign in first'
    //     })
    // }
    const user = await User.findById("60451e36dcceee7e311cc508");

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    return res.status(200).json({
      name: user.name,
      imageUrl: user.imageUrl,
      bio: user.bio,
    });
  } catch (err) {
    const error = errorCreator("Error occured in the server", 500);
    return next(error);
  }
};

exports.createPersonalMessage = async (req, res, next) => {
  try {
    const { receiver, content } = req.body;
    const newMessage = new Message({
      content: content,
      sender: req.userId,
      receiver: receiver,
    });

    const resul = await newMessage.save();

    const msg = await Message.findOne({ _id: resul._id })
      .populate("sender", "imageUrl name myAsk email")
      .populate("receiver", "imageUrl name myAsk email")
      .exec();

    io.getIO().emit("messageP", {
      action: "addmessageP",
      message: msg,
    });

    io.getIO().emit("newChat", {
      chat: {
        user: await User.findById(req.userId).select("name imageUrl myAsk email"),
        lastMessage: msg,
      },
    });

    return res.status(201).json({
      message: msg,
    });
  } catch (err) {
    const error = errorCreator(err.message, 500);
    return next(error);
  }
};

exports.getAllChats = async (req, res, next) => {
  try {
    const users = new Set();

    // const chatss = await Message.find({
    //   $or: [{ sender: req.userId }, { receiver: req.userId }],
    // });

    const chats = await Message.find({ sender: req.userId })
      .populate("receiver", "name imageUrl myAsk email")
      .exec();

    const chats2 = await Message.find({ receiver: req.userId })
      .populate("sender", "name imageUrl myAsk email")
      .exec();

    chats.forEach((chat) => {
      users.add(chat.receiver._id.toString());
    });

    chats2.forEach((chat) => {
      users.add(chat.sender._id.toString());
    });

    let chatUsers = [];

    for (let item of users) {
      //  if (item !== sender) {
      const lastMessage = await Message.findOne({
        $or: [
          { sender: req.userId, receiver: item },
          { sender: item, receiver: req.userId },
        ],
      })
        .sort({ _id: -1 })
        .exec();
      chatUsers.push({
        user: await User.findOne({ _id: item }).select("name imageUrl myAsk email"),
        lastMessage: lastMessage,
      });
      //}
    }

    const listOfChats = chatUsers.sort((a, b) => {
      return b.lastMessage.createdAt - a.lastMessage.createdAt;
    });

    return res.status(200).json({
      chatUsers: listOfChats,
    });
  } catch (err) {
    console.log(err.message);
    const error = errorCreator(err.message, 500);
    return next(error);
  }
};

exports.getPersonalMessages = async (req, res, next) => {
  try {
    const { receiver } = req.body;

    const mss = await Message.find({
      $or: [
        { sender: req.userId, receiver: receiver },
        { sender: receiver, receiver: req.userId },
      ],
    })
      .sort({ _id: 1 })
      .populate("receiver", "name imageUrl myAsk email")
      .populate("sender", "name imageUrl myAsk email")
      .exec();

    if (!mss) {
      return res.status(404).json({
        message: "no previous conversation before",
      });
    }

    return res.status(200).json({
      messages: mss,
    });
  } catch (err) {
    const error = errorCreator(err.message, 500);
    return next(error);
  }
};

exports.changeProfileImage = async (req, res, next) => {
  try {
    const image = req.file;
    if (!image) {
      throw errorCreator("No Image Selected!", 422);
    }

    const user = await User.findById(req.userId);
    if (!user) {
      throw errorCreator("User Not Found", 500);
    }
    if (user.imageUrl !== "images/no-image.png") {
      fileHelper.deleteFile(user.imageUrl, (error) => {
        return next(errorCreator("Error Uploading Image", 500));
      });
    }

    user.imageUrl = image.path;
    await user.save();

    return res.status(201).json({
      imageUrl: image.path,
    });
  } catch (err) {
    return next(err);
  }
};

exports.switchNotifications = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      throw errorCreator("Not Authorized", 403);
    }

    user.notifications = !user.notifications;

    await user.save();

    return res.status(201).json({
      message: "Toggled",
    });
  } catch (err) {
    return next(err);
  }
};
exports.switchMyAsk = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      throw errorCreator("Not Authorized", 403);
    }

    user.myAsk = !user.myAsk;

    await user.save();

    return res.status(201).json({
      message: "Toggled",
    });
  } catch (err) {
    return next(err);
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ "To.member": req.userId })
      .sort({ _id: -1 })
      .populate("payload.item.owner", "name imageUrl myAsk email")
      .exec();

    if (!notifications) {
      throw errorCreator("No Notifications found", 404);
    }

    return res.status(200).json({
      notifications: notifications,
    });
  } catch (err) {
    console.log("notifications error man");
    return next(err);
  }
};

exports.searchForUser = async (req, res, next) => {
  try {
    const username = req.query.username;
    const searchResults = await User.find({
      $text: { $search: username },
    }).select("name imageUrl myAsk email");

    if (!searchResults) {
      throw errorCreator("No Users Found", 404);
    }

    return res.status(200).json({
      searchResults: searchResults,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getFeed = async (req, res, next) => {
  try {
    const { courses, departmentId, publicGroupId, userType } = req.body;
    const coursesIds = JSON.parse(courses).map((course) => {
      return course._id;
    });

    let filter;

    if (userType === "teacher") {
      filter = {
        $or: [
          { groupId: departmentId, groupType: "admin" },
          { groupId: { $in: coursesIds } },
        ],
      };
    } else if (userType === "student") {
      coursesIds.push(publicGroupId);
      coursesIds.push(departmentId);
      filter = {
        groupId: { $in: coursesIds },
      };
    }

    const posts = await Post.find(filter)
      .limit(5)
      .sort({ _id: -1 })
      .populate("owner", "name imageUrl myAsk email")
      .exec();

    const polls = await Poll.find(filter)
      .limit(5)
      .sort({ _id: -1 })
      .populate("owner", "name imageUrl myAsk email")
      .exec();

    const questions = await Question.find(filter)
      .limit(5)
      .sort({ _id: -1 })
      .populate("owner", "name imageUrl myAsk email")
      .exec();

    let timeline = posts
      .concat(polls)
      .concat(questions)
      .sort((a, b) => {
        return b.createdAt - a.createdAt;
      });

    console.log(posts);
    return res.status(200).json({
      timeline: timeline,
    });
  } catch (err) {
    console.log(err.message);
    return next(err);
  }
};


