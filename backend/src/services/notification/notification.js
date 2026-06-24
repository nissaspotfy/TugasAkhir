const { Notification } = require('../../models');
const { NotFoundError, BaseError } = require('../../common/responses/error-response');
const { StatusCodes } = require('http-status-codes');

const getUserNotifications = async (userId, roleName) => {
    const whereClause = roleName === 'Admin' ? { user_id: null } : { user_id: userId };
    
    const notifications = await Notification.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: 50
      });
      
    return notifications;
};

const createNotification = async ({ userId, title, message, type = 'info' }) => {
    const newNotification = await Notification.create({
        user_id: userId || null,
        title,
        message,
        type
    });
    return newNotification;
};

const markAsRead = async (notificationId, userId, roleName) => {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
        throw new NotFoundError('Notifikasi tidak ditemukan');
    }

    if (roleName !== 'Admin' && notification.user_id !== userId) {
        throw new BaseError(StatusCodes.FORBIDDEN, 'Anda tidak berwenang membaca notifikasi ini');
    }

    notification.is_read = true;
    await notification.save();
    return notification;
};

const markAllAsRead = async (userId, roleName) => {
    const whereClause = roleName === 'Admin' ? { user_id: null, is_read: false } : { user_id: userId, is_read: false };
    
    await Notification.update(
        { is_read: true },
        { where: whereClause }
    );
    
    return { success: true };
};

module.exports = {
    getUserNotifications,
    createNotification,
    markAsRead,
    markAllAsRead
};
