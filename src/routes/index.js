'use strict';

const express = require('express');
const { getProfile } = require('../middleware/getProfile');
const { checkClient } = require('../middleware/checkClient');
const contractController = require('../controllers/contractController');
const jobController = require('../controllers/jobController');
const profileController = require('../controllers/profileController');
const adminController = require('../controllers/adminController');
const utils = require('./utils');

const router = express.Router();

/**
 * @returns contract by id
 */
router.get('/contracts/:id', getProfile, contractController.getById);
/**
 * @returns list of contracts belonging to a user
 */
router.get('/contracts', getProfile, contractController.list);
/**
 * @returns list of all unpaid jobs for a user
 */
router.get('/jobs/unpaid', getProfile, jobController.listByPaid);
/**
 * @returns list of all paid jobs for a user
 */
router.get('/jobs/paid', getProfile, jobController.listByPaid);
/**
 * @returns paid job data
 */
router.post('/jobs/:job_id/pay', getProfile, checkClient, jobController.pay);
/**
 * @returns updated user profile - a client can deposit for themselves or for another client
 */
router.post('/balances/deposit/:user_id', getProfile, checkClient, profileController.deposit);
/**
 * @returns the profession that earned the most money
 */
router.get('/admin/best-profession', getProfile, adminController.bestProfession);
/**
 * @returns the clients that paid the most money for jobs
 */
router.get('/admin/best-clients', getProfile, adminController.listBestClients);

// catch 404 and forward to error handler
router.use((req, res, next) => {
  const err = new Error('Resource not found.');
  err.status = 404;
  next(err);
});

// error handler
router.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  res.status(err.status || 500).json(utils.wrapResponse(err));
});

module.exports = router;
