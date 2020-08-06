'use strict';

const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const kinesis = new AWS.Kinesis();

const TABLE_NAME = process.env.maintenanceTaskTableName;
const STREAM_NAME = process.env.maintenanceTaskStreamName;

module.exports.createMaintenanceTask = body => {
	const maintenanceTask = {
		taskId: uuidv4(),
		label: body.label,
		taskTypeId: body.taskTypeId,
		taskTypeLabel: body.taskTypeLabel,
		licensePlate: body.licensePlate,
		dueDate: body.dueDate,
		creationDate: Date.now(),
		eventType: 'maintenance_task_created'
	}
	return maintenanceTask;
}

module.exports.publishMaintenanceTask = maintenanceTask => {
	return saveMaintenanceTask(maintenanceTask).then( () => {
		return addMaintenanceTaskStream(maintenanceTask)
	})
}

module.exports.scheduleMaintenanceTask = (taskId,scheduledDate,operatorId,operatorName,taskDuration) => {
    return getMaintenanceTask(taskId).then(savedMaintenanceTask => {
        const maintenanceTask = createScheduleMaintenanceTask(savedMaintenanceTask,scheduledDate,operatorId,operatorName,taskDuration);
        return saveMaintenanceTask(maintenanceTask).then(() => {
           return addMaintenanceTaskStream(maintenanceTask) 
        });
    });
}

function createScheduleMaintenanceTask(savedMaintenanceTask,scheduledDate,operatorId,operatorName,taskDuration) {
	savedMaintenanceTask.scheduledDate = scheduledDate;
    savedMaintenanceTask.operatorId = operatorId;
	savedMaintenanceTask.operatorName = operatorName;
	savedMaintenanceTask.taskDuration = taskDuration;
    savedMaintenanceTask.eventType = 'maintenance_task_scheduled';
    return savedMaintenanceTask;
}


function getMaintenanceTask(taskId) {
    const params = {
        Key: {
            taskId: taskId
        },
        TableName: TABLE_NAME
    };
    return dynamo.get(params).promise().then(result => {
        return result.Item;
    })
}

function saveMaintenanceTask(maintenanceTask) {
	const params = {
		TableName: TABLE_NAME,
		Item: maintenanceTask
	}
	return dynamo.put(params).promise();
}

function addMaintenanceTaskStream(maintenanceTask){
	const params = {
		Data: JSON.stringify(maintenanceTask),
		PartitionKey: maintenanceTask.taskId,
		StreamName: STREAM_NAME
	}
	return kinesis.putRecord(params).promise();
}
