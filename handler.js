'use strict';

const maintenanceTaskManager = require('./maintenanceTaskManager');

//'Maintenance task created from http POST request, saved in DynamoDB and published to Kinesis !!'
function createResponse(statusCode,message){
  const response = {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };

  return response;
}

module.exports.createMaintenanceTask = async event => {

  const body = JSON.parse(event.body);
  const maintenanceTask = maintenanceTaskManager.createMaintenanceTask(body);

  return maintenanceTaskManager.publishMaintenanceTask(maintenanceTask).then( () => {
    return createResponse(200, maintenanceTask);
  }).catch(error => {
    return createResponse(400, error);
  })

};

module.exports.scheduleMaintenanceTask = async event => {

  const body = JSON.parse(event.body);
  const taskId = body.taskId;
  const scheduledDate = body.scheduledDate;
  const operatorId = body.operatorId;
  const operatorName = body.operatorName;
  const taskDuration = body.taskDuration;

  return maintenanceTaskManager.scheduleMaintenanceTask(taskId,scheduledDate,operatorId,operatorName,taskDuration).then( () => {
    return createResponse(200, `Tâche de maintenance :${taskId} planifiée`);
  }).catch(error => {
    return createResponse(400, error);
  })

};
