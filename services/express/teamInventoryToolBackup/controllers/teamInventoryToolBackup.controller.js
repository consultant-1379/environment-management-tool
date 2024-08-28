const TeamInventoryToolBackup = require('../models/teamInventoryToolBackup.model');
const logger = require('./../../logger/logger');

/**
 * teamInventoryToolBackup.controller.js
 *
 * @description :: Server-side logic for managing the backup of the response from team inventory tool.
 */
module.exports = {
  list: (req, res) => {
    const logMessage = 'GET /team-inventory-tool-backup';
    TeamInventoryToolBackup.find((err, teamInventoryBackups) => {
      if (err) {
        logger.error(logMessage, 'Error getting response from team inventory tool.', err);
        return res.status(500).json({
          message: 'Error getting response from team inventory tool.',
          error: err,
        });
      }
      if (teamInventoryBackups.length === 0) {
        return res.status(404).json({
          backups: teamInventoryBackups,
          message: 'No team inventory tool backups found',
        });
      }
      return res.json(teamInventoryBackups[0]);
    });
  },
};
