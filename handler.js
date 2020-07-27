'use strict';

module.exports.createMaintenanceTask = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'create maintenance task !',
        input: event,
      },
      null,
      2
    ),
  };
};
