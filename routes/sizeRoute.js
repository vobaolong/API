const express = require('express');
const {
  createSize,
  updateSize,
  deleteSize,
  getSize,
  getAllSizes,
} = require('../controllers/sizeCtrl');
const {
  isAuthenticatedUser,
  authorizedRoles,
} = require('../middleware/auth');
const router = express.Router();

router.post('/admin/size', isAuthenticatedUser, authorizedRoles('admin'), createSize);
router.put('/admin/size/:id', isAuthenticatedUser, authorizedRoles('admin'), updateSize);
router.delete(
  '/admin/size/:id',
  isAuthenticatedUser,
  authorizedRoles('admin'),
  deleteSize
);
router.get('/size/:id', getSize);
router.get('/size/', getAllSizes);

module.exports = router;
