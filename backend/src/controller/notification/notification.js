const BaseResponse = require('../../common/responses/base-response');
const { StatusCodes } = require('http-status-codes');
const { role, user } = require('../../models');
const {
    getUserNotifications,
    markAsRead,
    markAllAsRead
} = require('../../services/notification/notification');

const getRoleName = async (reqUser) => {
    if (reqUser.role) {
        return reqUser.role.nama_role;
    }
    const userWithRole = await user.findByPk(reqUser.id, {
        include: [{ model: role, as: 'role' }]
    });
    return userWithRole?.role?.nama_role || 'User';
};

const getUserNotificationsController = async (req, res, next) => {
    try {
        const roleName = await getRoleName(req.user);
        const result = await getUserNotifications(req.user.id, roleName);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Notifications retrieved successfully',
                data: result
            })
        );
    } catch (error) {
        next(error);
    }
};

const markAsReadController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const roleName = await getRoleName(req.user);
        const result = await markAsRead(id, req.user.id, roleName);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Notification marked as read',
                data: result
            })
        );
    } catch (error) {
        next(error);
    }
};

const markAllAsReadController = async (req, res, next) => {
    try {
        const roleName = await getRoleName(req.user);
        await markAllAsRead(req.user.id, roleName);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'All notifications marked as read',
                data: null
            })
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserNotificationsController,
    markAsReadController,
    markAllAsReadController
};
