import time
import boto3
import os
import base64

stream_name = 'ada-stats-stream'
region = 'eu-west-3'
#aws_profile = 'citrus'
aws_profile = 'toto'

'''
if aws_profile:
    os.environ['AWS_PROFILE'] = aws_profile
'''

kinesis_client = boto3.client('kinesis', region_name=region)

response = kinesis_client.describe_stream(StreamName=stream_name)

my_shard_id = response['StreamDescription']['Shards'][0]['ShardId']

shard_iterator = kinesis_client.get_shard_iterator(StreamName=stream_name,ShardId=my_shard_id,ShardIteratorType='LATEST')

my_shard_iterator = shard_iterator['ShardIterator']

record_response = kinesis_client.get_records(ShardIterator=my_shard_iterator,Limit=100)

while 'NextShardIterator' in record_response:
    print('************************************************************************************************')
    record_response = kinesis_client.get_records(ShardIterator=record_response['NextShardIterator'],Limit=100)
    records = record_response['Records']
    if len(records) > 0:
        for record in records:
            print(record['Data'])
    else:
        print('no new records')
    #payload=base64.b64decode(record_response["data"])
    #print("Decoded payload: " + str(payload))	
    time.sleep(10)