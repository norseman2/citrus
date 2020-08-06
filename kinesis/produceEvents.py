import datetime
import time
import threading
import boto3
from botocore.config import Config
import sys
import os
from random import seed
from random import randint
import json

# seed random number generator
seed(1)

stream_name = 'ada-stats-stream'
region = 'eu-west-3'
aws_profile = 'citrus'

my_config = Config(
    region_name = region,
)

if aws_profile:
    os.environ['AWS_PROFILE'] = aws_profile

class KinesisProducer(threading.Thread):
    """Producer class for AWS Kinesis streams"""

    def __init__(self, kinesis_client, stream_name, producer_name, sleep_interval):
        self.stream_name = stream_name
        self.sleep_interval = sleep_interval
        self.producer_name = producer_name
        self.kinesis_client = kinesis_client
        super().__init__()

    def put_record(self):
        """put a single record to the stream"""
        payload = {
            'eventId': randint(2000,3000),
            'source': self.producer_name,
            'timestamp': datetime.datetime.utcnow().timetuple()
        }
        response = self.kinesis_client.put_record(
            StreamName=self.stream_name,
            Data=json.dumps(payload),
            PartitionKey=self.producer_name
        )
        #print(response)
        print('record added to stream ',payload)

    def run_continously(self):
        """put a record at regular intervals"""
        while True:
            self.put_record()
            time.sleep(self.sleep_interval)

    def run(self):
        """run the producer"""
        try:
            if self.sleep_interval:
                self.run_continously()
            else:
                self.put_record()
        except:
            e = sys.exc_info()[1]
            print(e)

kinesis_client = boto3.client('kinesis', config=my_config)
producer1 = KinesisProducer(kinesis_client, stream_name, 'website', 1)
producer2 = KinesisProducer(kinesis_client, stream_name, 'hitech', 2)
producer1.start()
#producer2.start()