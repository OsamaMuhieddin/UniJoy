const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Event = require('../models/event');
const User = require('../models/user');
const HostCategory = require('../models/hostCategory');

exports.getHostCategories = (req, res, next) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const skip = (page - 1) * limit;

  const shouldPaginate = !isNaN(page) && !isNaN(limit);

  let totalItems;
  const countPromise = shouldPaginate
    ? HostCategory.countDocuments()
    : Promise.resolve(null);

  countPromise
    .then((count) => {
      totalItems = count;
      const findQuery = HostCategory.find();

      if (shouldPaginate) {
        findQuery.skip(skip).limit(limit);
      }

      return findQuery;
    })
    .then((categories) => {
      res.status(200).json({
        message: 'Host categories fetched successfully',
        categories: categories,
        totalItems: totalItems || categories.length,
        paginated: shouldPaginate,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.createHostCategory = (req, res, next) => {
  if (req.userRole !== 'admin') {
    const error = new Error('Not authorized to create host categories');
    error.statusCode = 403;
    throw error;
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect');
    error.statusCode = 422;
    throw error;
  }

  const name = req.body.name;
  const description = req.body.description;

  const hostCategory = new HostCategory({
    name: name,
    description: description,
  });

  hostCategory
    .save()
    .then((result) => {
      res.status(201).json({
        message: 'Host category created successfully',
        hostCategory: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.getHostCategory = (req, res, next) => {
  const hostCategoryId = req.params.hostCategoryId;

  HostCategory.findById(hostCategoryId)
    .then((hostCategory) => {
      if (!hostCategory) {
        const error = new Error('Could not find host category');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: 'Host category fetched!',
        hostCategory: hostCategory,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateHostCategory = (req, res, next) => {
  const hostCategoryId = req.params.hostCategoryId;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect');
    error.statusCode = 422;
    throw error;
  }

  const name = req.body.name;
  const description = req.body.description;

  HostCategory.findById(hostCategoryId)
    .then((hostCategory) => {
      if (!hostCategory) {
        const error = new Error('Could not find host category');
        error.statusCode = 404;
        throw error;
      }

      if (req.userRole !== 'admin') {
        const error = new Error('Not authorized to update this host category');
        error.statusCode = 403;
        throw error;
      }

      hostCategory.name = name;
      hostCategory.description = description;

      return hostCategory.save();
    })
    .then((updatedHostCategory) => {
      res.status(200).json({
        message: 'Host category updated successfully',
        hostCategory: updatedHostCategory,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteHostCategory = (req, res, next) => {
  const hostCategoryId = req.params.hostCategoryId;

  HostCategory.findById(hostCategoryId)
    .then((hostCategory) => {
      if (!hostCategory) {
        const error = new Error('Could not find host category!');
        error.statusCode = 404;
        throw error;
      }
      if (req.userRole !== 'admin') {
        const error = new Error('Not authorized to delete this host category');
        error.statusCode = 403;
        throw error;
      }
      return HostCategory.findByIdAndDelete(hostCategoryId);
    })
    .then(() => {
      res.status(200).json({ message: 'Host category deleted successfully' });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
