const express = require('express');
const {
  ensureUser,
  getUserById,
  createTopupRequest,
  getTopupRequestById,
  getPendingRequests,
  approveTopupRequest,
  rejectTopupRequest
} = require('../lib/db');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

router.get('/config/momo', (req, res) => {
  res.json({
    momoNumber: process.env.MOMO_NUMBER || '0256802586',
    recipientName: process.env.MOMO_RECIPIENT_NAME || 'Ametepey Derrick Delali',
    network: process.env.MOMO_NETWORK || 'MTN'
  });
});

router.get('/wallet/balance', (req, res) => {
  const userId = req.query.userId || req.headers['x-user-id'] || 'demo-user';
  const user = ensureUser(userId);

  res.json({
    userId: user.id,
    balance: user.balance,
    userCode: user.user_code
  });
});

router.get('/user/code', (req, res) => {
  const userId = req.query.userId || req.headers['x-user-id'] || 'demo-user';
  const user = ensureUser(userId);

  res.json({ userCode: user.user_code });
});

router.post('/topup/request', (req, res) => {
  const { amount, transactionId, userCode } = req.body || {};
  const userId = req.headers['x-user-id'] || 'demo-user';
  const user = ensureUser(userId);

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than zero.' });
  }

  const request = createTopupRequest({
    user_id: user.id,
    amount,
    transaction_id: transactionId || '',
    user_code: userCode || user.user_code
  });

  return res.json({
    success: true,
    requestId: request.id,
    status: request.status,
    message: 'Your top-up request is pending review. No balance is credited until an admin approves it.'
  });
});

router.get('/topup/status/:id', (req, res) => {
  const request = getTopupRequestById(req.params.id);

  if (!request) {
    return res.status(404).json({ error: 'Top-up request not found.' });
  }

  const user = getUserById(request.user_id);

  return res.json({
    requestId: request.id,
    status: request.status,
    amount: request.amount,
    userCode: request.user_code,
    transactionId: request.transaction_id,
    createdAt: request.created_at,
    reviewedAt: request.reviewed_at,
    reviewedBy: request.reviewed_by,
    balance: user ? user.balance : 0
  });
});

router.get('/admin/topups/pending', requireAdmin, (req, res) => {
  const pending = getPendingRequests();
  const enriched = pending.map((request) => {
    const user = getUserById(request.user_id);
    return {
      ...request,
      balance: user ? user.balance : 0
    };
  });

  return res.json(enriched);
});

router.post('/admin/topups/:id/approve', requireAdmin, (req, res) => {
  const request = approveTopupRequest(req.params.id, req.headers['x-admin-name'] || 'admin');

  if (!request) {
    return res.status(404).json({ error: 'Top-up request not found.' });
  }

  return res.json({ success: true, request });
});

router.post('/admin/topups/:id/reject', requireAdmin, (req, res) => {
  const request = rejectTopupRequest(req.params.id, req.headers['x-admin-name'] || 'admin');

  if (!request) {
    return res.status(404).json({ error: 'Top-up request not found.' });
  }

  return res.json({ success: true, request });
});

module.exports = router;
