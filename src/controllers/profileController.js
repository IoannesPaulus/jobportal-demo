'use strict';

const { Op, Transaction } = require('sequelize');
const { sequelize } = require('../model');

async function deposit(req, res) {
  const { Job, Contract, Profile } = req.app.get('models');
  const { user_id: id } = req.params;
  const { amount } = req.body;
  const profile = await Profile.findOne({ where: { id } });
  if (!profile) return res.status(404).end();
  if (profile.type !== 'client') return res.status(403).end();
  if (typeof (amount) === 'undefined') return res.status(400).json({ error: 'Missing amount.' }).end();
  const totalOutstandingAmount = await Job.sum('price', {
    include: {
      model: Contract,
      required: true,
      where: {
        ClientId: id,
        status: {
          [Op.in]: ['new', 'in_progress']
        }
      }
    },
    where: {
      paid: {
        [Op.or]: [
          false,
          { [Op.eq]: null }
        ]
      }
    }
  });
  if (amount > (totalOutstandingAmount || 0) * 0.25) return res.status(400).json({ error: 'Amount too large.' }).end();
  try {
    const result = await sequelize.transaction({
      isolationlevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
    }, async (t) => {
      return profile.increment({ balance: amount }, { transaction: t });
    });
    await result.reload();
    if (id === req.profile.id) {
      await req.profile.reload();
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong.' }).end();
  }
}

module.exports = {
  deposit
};
