const express = require('express');
const { body } = require('express-validator');

const hostCategoryController = require('../controllers/hostCategory');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /host-categories
// Supports optional pagination via query params: page and limit
router.get('/', hostCategoryController.getHostCategories);

// GET /host-categories/:hostCategoryId
router.get('/:hostCategoryId', hostCategoryController.getHostCategory);

// POST /host-categories
router.post(
  '/',
  isAuth,
  [
    body('name').trim().isLength({ min: 3 }),
    body('description').trim().isLength({ min: 5 }),
  ],
  hostCategoryController.createHostCategory
);

// PUT /host-categories/:hostCategoryId
router.put(
  '/:hostCategoryId',
  isAuth,
  [
    body('name').trim().isLength({ min: 3 }),
    body('description').trim().isLength({ min: 5 }),
  ],
  hostCategoryController.updateHostCategory
);

// DELETE /admin/host-categories/:hostCategoryId
router.delete(
  '/:hostCategoryId',
  isAuth,
  hostCategoryController.deleteHostCategory
);

module.exports = router;
