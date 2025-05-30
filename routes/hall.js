const express = require('express');
const { body } = require('express-validator');

const hallController = require('../controllers/hall');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /halls
// Supports optional pagination with page and limit query params
router.get('/', hallController.getHalls);

//Get /halls/:hallId
router.get('/:hallId', hallController.getHall);

//Post /halls
router.post(
  '/',
  isAuth,
  [
    body('name').trim().isLength({ min: 3 }),
    body('location').trim().isLength({ min: 5 }),
    body('capacity').isInt({ min: 1 }),
  ],
  hallController.createHall
);

//Put /halls/:hallId
router.put(
  '/:hallId',
  isAuth,
  [
    body('name').trim().isLength({ min: 3 }),
    body('location').trim().isLength({ min: 5 }),
    body('capacity').isInt({ min: 1 }),
    body('status')
      .optional()
      .isIn(['available', 'reserved'])
      .withMessage('Status must be either "available" or "reserved"'),
  ],
  hallController.updateHall
);

//Delete /halls/:hallId
router.delete('/:hallId', isAuth, hallController.deleteHall);

module.exports = router;
