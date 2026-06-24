const { setting } = require('../../models');

const getStoreStatus = async () => {
    const s = await setting.findByPk('is_store_open');
    return s ? s.value === 'true' : true;
};

const updateStoreStatus = async (isOpen) => {
    const valueStr = isOpen ? 'true' : 'false';
    let s = await setting.findByPk('is_store_open');
    if (!s) {
        s = await setting.create({ key: 'is_store_open', value: valueStr });
    } else {
        await s.update({ value: valueStr });
    }
    return s.value === 'true';
};

module.exports = {
    getStoreStatus,
    updateStoreStatus
};
