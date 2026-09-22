const visitorService = require('../services/visitorService');
const { validateVisitorRegistration } = require('../utils/validation');

async function getAllVisitors(req, res, next) {
  try {
    const { search } = req.query;
    const visitors = await visitorService.getAllVisitors(search);
    res.json({
      success: true,
      data: visitors,
      count: visitors.length
    });
  } catch (err) {
    next(err);
  }
}

async function getVisitorById(req, res, next) {
  try {
    const { id } = req.params;
    const visitor = await visitorService.getVisitorById(id);
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: `Visitor with ID '${id}' not found.`
      });
    }
    res.json({
      success: true,
      data: visitor
    });
  } catch (err) {
    next(err);
  }
}

async function createVisitor(req, res, next) {
  try {
    const performedBy = req.user.name;
    const role = req.user.role;
    const validation = validateVisitorRegistration(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors.join(' '),
        errors: validation.errors
      });
    }

    const created = await visitorService.createVisitor(req.body, performedBy, role);
    res.status(201).json({
      success: true,
      data: created,
      message: 'Visitor registered successfully.'
    });
  } catch (err) {
    next(err);
  }
}

async function updateVisitor(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await visitorService.updateVisitor(id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Visitor with ID '${id}' not found.`
      });
    }
    res.json({
      success: true,
      data: updated,
      message: 'Visitor profile updated successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllVisitors,
  getVisitorById,
  createVisitor,
  updateVisitor
};
