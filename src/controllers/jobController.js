'use strict';

const { Op } = require('sequelize');
const { sequelize } = require('../model');

async function listByPaid(req, res) {
  const paidDesc = req.path.substring(req.path.lastIndexOf('/') + 1);
  const paid = paidDesc !== 'unpaid';
  const { Job, Contract } = req.app.get('models');
  let jobs = [];
  if (paid) {
    jobs = await Job.findAll({
      include: {
        model: Contract,
        required: true,
        where: {
          [Op.or]: [
            { ClientId: req.profile.id },
            { ContractorId: req.profile.id }
          ],
          status: 'in_progress'
        }
      },
      where: {
        paid
      }
    });
  } else {
    jobs = await Job.findAll({
      include: {
        model: Contract,
        required: true,
        where: {
          [Op.or]: [
            { ClientId: req.profile.id },
            { ContractorId: req.profile.id }
          ],
          status: 'in_progress'
        }
      },
      where: {
        [Op.or]: [
          { paid },
          {
            paid: {
              [Op.eq]: null
            }
          }
        ]
      }
    });
  }
  return res.json(jobs);
}

async function pay(req, res) {
  const { Job, Contract, Profile } = req.app.get('models');
  const { job_id: id } = req.params;
  try {
    const result = await sequelize.transaction(async (t) => {
      const job = await Job.findOne({
        include: {
          model: Contract,
          required: true,
          include: {
            model: Profile,
            as: 'Contractor',
            required: true
          },
          where: {
            ClientId: req.profile.id,
            status: 'in_progress'
          }
        },
        where: {
          id,
          paid: {
            [Op.or]: [
              false,
              { [Op.eq]: null }
            ]
          }
        }
      }, { transaction: t });
      if (!job) return res.status(400).end();
      if (req.profile.balance < job.price) return res.status(400).json({ error: 'Insufficient balance.' }).end();
      await req.profile.decrement({
        balance: job.price
      }, { transaction: t });
      await job.Contract.Contractor.increment({
        balance: job.price
      }, { transaction: t });
      return job.update({
        paid: true,
        paymentDate: Date.now()
      }, { transaction: t });
    });
    await req.profile.reload();
    await result.reload();
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong.' }).end();
  }
}

module.exports = {
  listByPaid,
  pay
};
