const User = require("../models/User");
const Message = require("../models/Message");
const errorCreator = require("../errorCreator");
const io = require("../socket");
const fileHelper = require("../util/file");

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
    const {receiver, content } = req.body;
    const newMessage = new Message({
      content: content,
      sender: req.userId,
      receiver: receiver,
    });

    const resul = await newMessage.save();

    const msg = await Message.findOne({ _id: resul._id })
      .populate("sender", "imageUrl name myAsk")
      .populate("receiver", "imageUrl name myAsk")
      .exec();

    io.getIO().emit("messageP", {
      action: "addmessageP",
      message: msg,
    });

    io.getIO().emit("newChat", {
      chat: {
        user: await User.findById(req.userId).select("name imageUrl myAsk"),
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
      .populate("receiver", "name imageUrl myAsk")
      .exec();

    const chats2 = await Message.find({ receiver: req.userId })
      .populate("sender", "name imageUrl myAsk")
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
        user: await User.findOne({ _id: item }).select("name imageUrl myAsk"),
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
      .populate("receiver", "name imageUrl myAsk")
      .populate("sender", "name imageUrl myAsk")
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

    fileHelper.deleteFile(user.imageUrl, (error) => {
      return next(errorCreator("Error Uploading Image", 500));
    });

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
