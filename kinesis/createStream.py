stream_name = 'ada-stats-stream'
region = 'eu-west-3'
aws_profile = 'citrus'

import boto3
from botocore.config import Config
import os
import time

my_config = Config(
    region_name = region,
)

if aws_profile:
    os.environ['AWS_PROFILE'] = aws_profile

client = boto3.client('kinesis', config=my_config)

def get_status():
    r = client.describe_stream(StreamName=stream_name)
    description = r.get('StreamDescription')
    status = description.get('StreamStatus')
    return status

def create_stream(stream_name):
    try:
        # create the stream
        client.create_stream(
			StreamName=stream_name,
			ShardCount=1
		)
        print('stream {} created in region {}'.format(stream_name, region))
    except:
        print('stream ',stream_name,'already exists')

    # wait for the stream to become active
    while get_status() != 'ACTIVE':
        time.sleep(1)
    print('stream {} is active'.format(stream_name))

create_stream(stream_name)