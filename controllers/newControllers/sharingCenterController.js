const errorCreator = require("../../errorCreator");
const SharedItem = require("../../models/SharedItem");
const SharingCenterRequest = require("../../models/SharingCenterRequest");
const RequestReplay = require("../../models/RequestReplay");
const io = require('../../socket')

exports.getDepartmentSharedItems = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const items = await SharedItem.find({
      departmentId: { $exists: false },
      departmentId: departmentId,
    })
      .populate("owner", "name imageUrl myAsk email")
      .exec();

    if (!items) {
      throw errorCreator("Items Not Found", 404);
    }

    return res.status(200).json({
      items: items,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getPublicSharedItems = async (req, res, next) => {
  try {
    const items = await SharedItem.find({ departmentId: { $exists: false } })
      .populate("owner", "name imageUrl myAsk email")
      .exec();

    if (!items) {
      throw errorCreator("Items Not Found", 404);
    }

    return res.status(200).json({
      items: items,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getUserSharedItems = async (req, res, next) => {
  try {
    const items = await SharedItem.find({ owner: req.userId })
      .populate("owner", "name imageUrl myAsk email")
      .exec();

    if (!items) {
      throw errorCreator("Items Not Found", 404);
    }

    return res.status(200).json({
      items: items,
    });
  } catch (err) {
    return next(err);
  }
};

exports.searchDepartmentSharedItems = async (req, res, next) => {
  try {
    const itemName = req.query.name;
    const { departmentId } = req.params;
    const items = await SharedItem.find({
      $text: { $search: itemName },
      departmentId: { $exists: true },
      departmentId: departmentId,
    })
      .populate("owner", "name imageUrl myAsk email")
      .exec();

    if (!items) {
      throw errorCreator("Items Not Found", 404);
    }

    res.status(200).json({
      items: items,
    });
  } catch (err) {
    return next(err);
  }
};

exports.searchPublicSharedItems = async (req, res, next) => {
  try {
    const itemName = req.query.name;
    const items = await SharedItem.find({
      departmentId: { $exists: false },
      $text: { $search: itemName },
    })
      .populate("owner", "name imageUrl myAsk email")
      .exec();

    if (!items) {
      throw errorCreator("Items Not Found", 404);
    }

    res.status(200).json({
      items: items,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getMyItemsRequests = async (req, res, next) => {
  try {
    const requests = await SharingCenterRequest.find({ sender: req.userId })
      .sort({_id : -1})
      .populate("sender", "name imageUrl myAsk email")
      .populate("receiver", "name imageUrl myAsk email")
      .populate("sharedItem")
      .exec();

    if (!requests) {
      throw errorCreator("Request Not Found", 404);
    }

    return res.status(200).json({
      requests: requests,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getOthersItemsRequests = async (req, res, next) => {
  try {
    const requests = await SharingCenterRequest.find({ receiver: req.userId })
      .sort({_id : -1})
      .populate("sender", "name imageUrl myAsk email")
      .populate("receiver", "name imageUrl myAsk email")
      .populate("sharedItem")
      .exec();

    if (!requests) {
      throw errorCreator("Request Not Found", 404);
    }

    return res.status(200).json({
      requests: requests,
    });
  } catch (err) {
    return next(err);
  }
};

exports.requestItemFromOwner = async (req, res, next) => {
  try {
    const { itemId, receiver, message } = req.body;

    const request = new SharingCenterRequest({
      sender: req.userId,
      receiver: receiver,
      message: message,
      sharedItem: itemId,
    });

    const result = await request.save();

    const createdRequest = await SharingCenterRequest.findById(result._id)
      .populate("sender", "name imageUrl myAsk email")
      .populate("receiver", "name imageUrl myAsk email")
      .populate("sharedItem")
      .populate("request")
      .exec()
      

    return res.status(201).json({
      request: createdRequest,
    });
  } catch (err) {
    return next(err);
  }
};

exports.replayToItemRequest = async (req, res, next) => {
  try {
    const { content, requestId, senderId} = req.body;

    

    const replay = new RequestReplay({
      content: content,
      sender: senderId,
      request: requestId,
    });

    const result = await replay.save();

    const createdReplay = await RequestReplay.findById(result._id)
      .populate("sender", "name imageUrl myAsk email")
      .exec();

    io.getIO().emit('commingReplay' , {
      replay : createdReplay,
      requestId : requestId  
    })  

    return res.status(201).json({
      replay: createdReplay,
    });
  } catch (err) {
    return next(err);
  }
};

exports.markItemAsReserved = async (req, res, next) => {
  try {
    const { itemId } = req.body;

    const item = await SharedItem.findById(itemId);

    if (!item) {
      throw errorCreator("Error Item Not found", 404);
    }

    item.reserved = true;
    await item.save();

    return res.status(201).json({
      message: "reserved",
    });
  } catch (err) {
    return next(err);
  }
};

exports.markItemAsUnReserved = async (req, res, next) => {
  try {
    const { itemId } = req.body;

    const item = await SharedItem.findById(itemId);

    if (!item) {
      throw errorCreator("Error Item Not found", 404);
    }

    item.reserved = false;
    await item.save();

    return res.status(201).json({
      message: "UnReserved",
    });
  } catch (err) {
    return next(err);
  }
};

exports.shareItem = async (req, res, next) => {
  try {
    const { title, details, price, departmentId } = req.body;
    const image = req.file;
    let item = {
      title: title,
      imageUrl: image.path,
      details: details,
      price: price,
      owner: req.userId,
    };

    if (!image) {
      throw errorCreator("No image selected", 422);
    }

    if (!departmentId) {
      item = new SharedItem(item);
    } else {
      item = new SharedItem({ ...item, departmentId: departmentId });
    }

    const result = await item.save();

    const createdItem = await SharedItem.findById(result._id)
      .populate("owner", "name imageUrl myAsk email ")
      .exec();

    return res.status(201).json({
      item: createdItem,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getRequestReplays = async (req, res, next) => {
  try {
    const {requestId} = req.params
    const replays = await RequestReplay.find({request : requestId})
    .populate('sender', 'name imageUrl myAsk email')
    .populate('request')
    .exec()
    
    if (!replays) {
      throw errorCreator('Replays not found', 404)
    }

    return res.status(200).json({
      replays : replays 
    })
  }
  catch (err) {
    return next (err)
  }
}
