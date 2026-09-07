const Audit = require('../models/Audit');

const listAuditLogs = async (req, res) => {
  try {
    const logs = await Audit.find()
      .sort({ time: -1 })
      .lean();

    res.json(logs);
  } catch (error) {
    console.error('List audit logs error:', error);

    res.status(500).json({
      error: 'Failed to fetch audit logs',
    });
  }
};

module.exports = {
  listAuditLogs,
};