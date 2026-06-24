const { user, role, profile, Transaction, Address } = require('../../models');
const { NotFoundError } = require('../../common/responses/error-response');

const getAllCustomers = async () => {
    const customers = await user.findAll({
        include: [
            {
                model: role,
                as: 'role',
                where: { nama_role: 'User' }
            },
            {
                model: profile,
                as: 'profiles'
            },
            {
                model: Transaction,
                as: 'transactions'
            },
            {
                model: Address,
                as: 'addresses'
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    return customers.map(c => {
        const primaryAddress = c.addresses?.find(a => a.is_primary) || c.addresses?.[0];
        const phoneNumber = primaryAddress ? primaryAddress.phone_number : '-';
        
        return {
            id: c.id,
            name: c.name,
            email: c.email,
            totalOrders: c.transactions?.length || 0,
            status: 'Aktif',
            joinedDate: new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            phoneNumber
        };
    });
};

const deleteUserAccount = async (userId) => {
    const userExist = await user.findByPk(userId);
    if (!userExist) {
        throw new NotFoundError('User not found');
    }
    await user.destroy({ where: { id: userId } });
};

module.exports = {
    getAllCustomers,
    deleteUserAccount
};
