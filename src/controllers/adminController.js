'use strict';

const { Op } = require('sequelize');
const { sequelize } = require('../model');

async function bestProfession(req, res) {
  const { Job, Contract, Profile } = req.app.get('models');
  const { start, end } = req.query;
  const startDate = start ? new Date(start) : new Date('1970-01-01');
  const endDate = end ? new Date(`${end} 23:59:59.999`) : new Date('3000-12-12');

  const sumsByProfession = await Job.findAll({
    attributes: [
      'Contract.Contractor.profession',
      [sequelize.fn('sum', sequelize.col('price')), 'earnings']
    ],
    include: {
      model: Contract,
      required: true,
      include: {
        model: Profile,
        as: 'Contractor',
        required: true
      }
    },
    where: {
      paid: true,
      paymentDate: {
        [Op.gte]: startDate,
        [Op.lte]: endDate
      }
    },
    group: ['Contract.Contractor.profession'],
    raw: true
  });
  if (!sumsByProfession) return res.status(404).end();
  // TODO: take into account if there is a tie (this will result in a single profession)
  const best = sumsByProfession.reduce((prev, curr) => {
    return prev.earnings > curr.earnings ? prev : curr;
  });
  const fkeys = ['profession', 'earnings'];
  const filtered = fkeys
    .reduce((obj, key) => {
      return {
        ...obj,
        [key]: best[key]
      };
    }, {});
  return res.json(filtered);
}

async function listBestClients(req, res) {
  const { Job, Contract, Profile } = req.app.get('models');
  const { start, end, limit } = req.query;
  const startDate = start ? new Date(start) : new Date('1970-01-01');
  const endDate = end ? new Date(`${end} 23:59:59.999`) : new Date('3000-12-12');
  const lmt = limit || 2;

  const bestClients = await Job.findAll({
    attributes: [
      'Contract.Client.id',
      'Contract.Client.firstName',
      'Contract.Client.lastName',
      [sequelize.fn('sum', sequelize.col('price')), 'payments']
    ],
    include: {
      model: Contract,
      required: true,
      include: {
        model: Profile,
        as: 'Client',
        required: true
      }
    },
    where: {
      paid: true,
      paymentDate: {
        [Op.gte]: startDate,
        [Op.lte]: endDate
      }
    },
    group: ['Contract.Client.id'],
    order: [[sequelize.col('payments'), 'DESC']],
    limit: lmt,
    raw: true
  });
  if (!bestClients) return res.status(404).end();
  const mapped = bestClients.map((c) => {
    return {
      id: c.id,
      fullName: `${c.firstName} ${c.lastName}`,
      paid: c.payments
    };
  });
  return res.json(mapped);
}

module.exports = {
  bestProfession,
  listBestClients
};
