const {PublicSharedItem} = require('../models/SharedItem')
const {DepartmentSharedItem} = require('../models/SharedItem')
const errorCreator = require('../errorCreator')

exports.getPublicSharingItems = async (req, res, next) => {
    try {
        const items = await PublicSharedItem.find()

        if (!items) {
            console.log('nooooooooooo')
            return res.status(404).json({
                message: 'no items found'
            })
        }

        res.status(200).json({
            items: items
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}

exports.searchPublicItems = async (req, res, next) => {
    try {
        const itemName = req.query.name
        const items = await PublicSharedItem
            .find({ $text: { $search: itemName } })

        res.status(200).json({
            items: items
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }

}

exports.searchDepartmentItems = async (req, res, next) => {
    try {
        const itemName = req.query.name
        const items = await DepartmentSharedItem
            .find({ $text: { $search: itemName } })


        res.status(200).json({
            items: items
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}

exports.getDepartmentSharingItems = async (req, res, next) => {
    try {
        const departmentId = req.params.departmentId
        const items = await DepartmentSharedItem.find({ departmentId: departmentId })

        if (!items) {
            return res.status(404).json({
                message: 'no items found'
            })
        }
        res.status(200).json({
            items: items
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}

exports.fetchUserItems = async (req, res, next) => {
    try {
        const userId = req.params.userId
        const items1 = await DepartmentSharedItem.find({ ownerId: userId })
        const items2 = await PublicSharedItem.find({ ownerId: userId })

        const items = items1.concat(items2)

        return res.status(200).json({
            items: items
        })

    }
    catch (err) {
        res.status(500).json({
            error: error
        })
    }

}

exports.postPublicShareditem = async (req, res, next) => {
    try {

        const { name, details, ownerId } = req.body
        const imageUrl = req.file.path

        const newItem = new PublicSharedItem({
            name: name,
            imageUrl: imageUrl,
            details: details,
            ownerId: ownerId,
        })

        await newItem.save()

        res.status(201).json({
            item: newItem
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}

exports.postDepartmentShareditem = async (req, res, next) => {
    try {

        const { name, details, ownerId, departmentId } = req.body
        const imageUrl = req.file.path

        const newItem = new DepartmentSharedItem({
            name: name,
            imageUrl: imageUrl,
            details: details,
            ownerId: ownerId,
            departmentId: departmentId
        })


        await newItem.save()

        res.status(201).json({
            item: newItem
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}