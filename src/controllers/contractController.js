'use strict';

const { Op } = require('sequelize');

async function getById(req, res) {
  const { Contract } = req.app.get('models');
  const { id } = req.params;
  const contract = await Contract.findOne({ where: { id } });
  if (!contract) return res.status(404).end();
  if (
    (req.profile.type !== 'client' || contract.ClientId !== req.profile.id) &&
    (req.profile.type !== 'contractor' || contract.ContractorId !== req.profile.id)
  ) {
    return res.status(403).end(); // forbidden
  }
  return res.json(contract);
}

async function list(req, res) {
  const { Contract } = req.app.get('models');
  const contracts = await Contract.findAll({
    where: {
      [Op.or]: [
        { ClientId: req.profile.id },
        { ContractorId: req.profile.id }
      ],
      status: {
        [Op.ne]: 'terminated'
      }
    }
  });
  if (!contracts) return res.status(400).end();
  return res.json(contracts);
}

module.exports = {
  getById,
  list
};
