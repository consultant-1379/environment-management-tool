const cron = require('node-cron');
const request = require('superagent');
const TeamInventoryToolBackupModel = require('../models/teamInventoryToolBackup.model');
const logger = require('./../../logger/logger');

const TEAM_INVENTORY_TOOL_URL = 'https://jira-api.seli.wh.rnd.internal.ericsson.com/jira-api/rest/team-emails';

cron.schedule('15 21 * * *', () => {
  TeamInventoryToolBackupModel.find({}, async (err, teamInventoryToolBackup) => {
    if (err) {
      logger.error('Error in getting backups of the team inventory tool.');
    }
    if (teamInventoryToolBackup.length > 0) {
      TeamInventoryToolBackupModel.findOne(
        { _id: teamInventoryToolBackup[0]._id }, async (retrieveOneBackupError, teamInventoryBackup) => {
          if (retrieveOneBackupError) {
            logger.error('Error when getting team inventory tool backup from list.');
          }
          let teamInventoryToolNewData;
          try {
            await request.get(TEAM_INVENTORY_TOOL_URL).then((teamInventoryToolResponse) => {
              teamInventoryToolNewData = teamInventoryToolResponse.body;
            });
          } catch (error) {
            logger.error('Could not connect to the team inventory tool.');
          }
          if (teamInventoryToolNewData) {
            teamInventoryBackup.items = teamInventoryToolNewData.items;
            teamInventoryBackup.save((saveErr) => {
              if (saveErr) {
                logger.error('Error when updating team inventory tool backup.');
              }
              logger.info('Team inventory tool backup updated!');
            });
          }
        },
      );
    } else {
      let teamInventoryToolNewData;
      try {
        await request.get(TEAM_INVENTORY_TOOL_URL).then((teamInventoryToolResponse) => {
          teamInventoryToolNewData = teamInventoryToolResponse.body;
        });
      } catch (error) {
        logger.error('Could not connect to the team inventory tool.');
      }
      if (teamInventoryToolNewData) {
        const teamInventoryBackup = new TeamInventoryToolBackupModel({
          size: teamInventoryToolNewData.size,
          name: teamInventoryToolNewData.name,
          items: teamInventoryToolNewData.items,
        });

        teamInventoryBackup.save((error) => {
          if (error) {
            logger.error('Error when creating team inventory tool backup.');
          }
          logger.info('Team inventory tool backup created!');
        });
      }
    }
  });
});
