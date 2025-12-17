Cloud Recording RESTful API
Agora Cloud Recording is a component provided by Agora to record and save voice calls, video calls, and interactive streaming. You can send HTTP requests from your business server to the Agora server to manage Cloud Recording tasks on the server side.

To monitor the status of your cloud recording, Agora provides the message notification service. After enabling this service, you receive events related to cloud recording through a webhook.

Since Agora dynamically adjusts the IP addresses of the message notification server, best practice is to regularly query the IP addresses and update the firewall whitelist configuration to continue receiving cloud recording notifications.

Base URL
​
https://api.sd-rtn.com

caution
The Agora RESTful API supports only HTTPS with TLS 1.0, 1.1, or 1.2. Requests over plain HTTP are not supported.

Authentication
​
When sending an HTTP request, use Basic HTTP authentication and fill in the Authorization field in the HTTP request header with the generated credentials. For details on generating the Authorization field, see Authenticate REST calls.

Endpoints
​
The RESTful API includes the following set of endpoints for managing the cloud recording functionality:

acquire: Request a resource ID for cloud recording.
start: Call this method within two seconds after getting the resource ID to start cloud recording. During recording, call query, update, and updateLayout methods as needed.
query: Check the status of cloud recording.
update: Update recording settings.
updateLayout: Update the video mixing layout.
stop: To end a recording, call stop to leave the channel and stop the recording.
acquire
​
Get a cloud recording resource ID.

POST /v1/apps/{appid}/cloud_recording/acquire

Before starting cloud recording, call the acquire method to get a resource ID. One resource ID can be used for only one recording session.

Note: To ensure success when starting cloud recording, proceed as follows:

Call acquire and start requests in pairs.
start cloud recording within two seconds of receiving the resource ID from each acquire request. Batch fetching of resource IDs followed by batch start requests may lead to request failure.
The resource ID is valid for five minutes and should be used as soon as possible.
Request body
​
1{
2  "cname": "httpClient463224",
3  "uid": "527841",
4  "clientRequest": {
5    "scene": 0,
6    "resourceExpiredHour": 24
7  }
8}
Parameters
​
Name	In	Type	Required	Description
Content-Type	header	String	false	application/json.
appid	path	String	true	The App ID for your project.
For web page recording mode, simply enter the App ID for which the cloud recording service is enabled.
For individual and composite recording modes, use the same App ID as for the channel to be recorded. Ensure that the cloud recording service has been enabled for this App ID.
body	body	JSON Object	true	acquire-request
200 Response
​
1{
2  "cname": "string",
3  "uid": "string",
4  "resourceId": "string"
5}
Response
​
status	Description	Schema
200 OK	If the returned HTTP status code is 200, the request is successful. If you set the startParameter object in the request body and its value is invalid, it will not affect the success of the acquire request, but you will receive an error in the subsequent start request.	acquire-response
Not 200	If the HTTP status code is not 200, see the response status code for troubleshooting.	Response status code
start
​
Start cloud recording.

POST /v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/mode/{mode}/start

After receiving a cloud recording resource ID using the acquire method, call the start method to start cloud recording.

info
After calling start, best practice is to check that the recording service has started successfully.

Request body
​
1{
2  "cname": "httpClient463224",
3  "uid": "527841",
4  "clientRequest": {
5    "recordingConfig": {
6      "channelType": 1,
7      "streamTypes": 2,
8      "streamMode": "default",
9      "videoStreamType": 0,
10      "maxIdleTime": 30,
11      "subscribeAudioUids": [
12        "123",
13        "456"
14      ],
15      "subscribeVideoUids": [
16        "123",
17        "456"
18      ],
19      "subscribeUidGroup": 0
20    },
21    "recordingFileConfig": {
22      "avFileType": [
23        "hls"
24      ]
25    },
26    "storageConfig": {
27      "vendor": 2,
28      "region": 3,
29      "bucket": "xxxxx",
30      "accessKey": "xxxxx",
31      "secretKey": "xxxxx",
32      "fileNamePrefix": [
33        "directory1",
34        "directory2"
35      ]
36    }
37  }
38}
Parameters
​
Name	In	Type	Required	Description
Content-Type	header	String	false	application/json.
appid	path	String	true	The App ID for your project.
For web page recording mode, simply enter the App ID for which the cloud recording service is enabled.
For individual and composite recording modes, use the same App ID as for the channel to be recorded. Ensure that the cloud recording service has been enabled for this App ID.
resourceId	path	String	true	The resource ID obtained using the acquire request.
mode	path	String	true	One of the following recording modes:
individual: Individual recording mode.
mix: Composite recording mode.
web: Web page recording mode.
body	body	JSON Object	true	start-request
200 Response
​
1{
2  "cname": "string",
3  "uid": "string",
4  "resourceId": "string",
5  "sid": "string"
6}
Response
​
status	Description	Schema
200	If the returned HTTP status code is 200, the request is successful. To check whether the recording service has started successfully, see the best practices to proceed.	Response Schema
Not 200	If the HTTP status code is not 200, see the response status code for troubleshooting.	Response status code
Response Schema
​
Status Code 200

Name	Type	Required	Description
cname	String	false	The name of the channel to be recorded.
uid	String	false	The user ID used by the cloud recording service in the RTC channel to identify the recording service in the channel.
resourceId	String	false	The cloud recording resource ID. The resource ID is valid for five minutes, after which you need to re-request it.
sid	String	false	The recording ID. After successfully starting cloud recording, you receive an sid (the recording ID). This ID uniquely identifies a recording cycle.
update
​
Update the cloud recording settings.

POST /v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/sid/{sid}/mode/{mode}/update

After starting the recording, call the update method to update the following recording configuration:

For individual and composite recordings, update the subscription list.
For web page recording, pause or resume the recording, or update the CDN streaming address (URL) where the web page recording is pushed to.
info
The update request is only valid within a recording session. If the recording was started incorrectly, or if the recording has ended, the update call returns 404.

If you need to call the update method successively to update recording settings, repeat the call after receiving the previous update response to avoid unexpected results.

Request body
​
1{
2  "cname": "httpClient463224",
3  "uid": "527841",
4  "clientRequest": {
5    "streamSubscribe": {
6      "audioUidList": {
7        "subscribeAudioUids": [
8          "#allstream#"
9        ]
10      },
11      "videoUidList": {
12        "unsubscribeVideoUids": [
13          "444",
14          "555",
15          "666"
16        ]
17      }
18    }
19  }
20}
Parameters
​
Name	In	Type	Required	Description
Content-Type	header	String	false	application/json.
appid	path	String	true	The App ID for your project.
For web page recording mode, simply enter the App ID for which the cloud recording service is enabled.
For individual and composite recording modes, use the same App ID as for the channel to be recorded. Ensure that the cloud recording service has been enabled for this App ID.
resourceId	path	String	true	The resource ID obtained using the acquire request.
sid	path	String	true	The recording ID obtained through start.
mode	path	String	true	One of the following recording modes:
individual: Individual recording mode.
mix: Composite recording mode.
web: Web page recording mode.
body	body	JSON Object	true	update-request
200 Response
​
1{
2  "cname": "string",
3  "uid": "string",
4  "resourceId": "string",
5  "sid": "string"
6}
Response
​
status	Description	Schema
200	If the returned HTTP status code is 200, the request is successful.	Response Schema
Not 200	If the HTTP status code is not 200, see the response status code for troubleshooting.	Response status code
Response Schema
​
Status Code 200

Name	Type	Required	Description
cname	String	false	The name of the channel to be recorded.
uid	String	false	The user ID used by the cloud recording service in the RTC channel to identify the recording service in the channel.
resourceId	String	false	The resource ID used by cloud recording.
sid	String	false	The recording ID, identifying each recording cycle.
updateLayout
​
Update the mixing layout of cloud recording.

POST /v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/sid/{sid}/mode/{mode}/updateLayout

After starting composite recording, call this method to update the mixing layout.

Each call to this method overrides the original layout settings. For example, if you set the backgroundColor field to "#FF0000" (red) when starting a recording and call the updateLayout method to update the mixing layout without setting the backgroundColor field again, the background color will change to black (the default value).

info
The updateLayout request is only valid within a session. If the recording was started incorrectly, or if the recording has ended, the updateLayout call returns 404.

If you need to call the updateLayout method successively to update the recording settings, repeat the call after receiving the previous updateLayout response to avoid unexpected results.

Request body
​
1{
2  "cname": "httpClient463224",
3  "uid": "527841",
4  "clientRequest": {
5    "mixedVideoLayout": 3,
6    "backgroundColor": "#FF0000",
7    "layoutConfig": [
8      {
9        "uid": "1",
10        "x_axis": 0.1,
11        "y_axis": 0.1,
12        "width": 0.1,
13        "height": 0.1,
14        "alpha": 1,
15        "render_mode": 1
16      },
17      {
18        "uid": "2",
19        "x_axis": 0.2,
20        "y_axis": 0.2,
21        "width": 0.1,
22        "height": 0.1,
23        "alpha": 1,
24        "render_mode": 1
25      }
26    ]
27  }
28}
Parameters
​
Name	In	Type	Required	Description
Content-Type	header	String	false	application/json.
appid	path	String	true	The App ID for your project.
For web page recording mode, simply enter the App ID for which the cloud recording service is enabled.
For individual and composite recording modes, use the same App ID as for the channel to be recorded. Ensure that the cloud recording service has been enabled for this App ID.
resourceId	path	String	true	The resource ID obtained using the acquire request.
sid	path	String	true	The recording ID obtained through start.
mode	path	String	true	The recording mode. Supports mix only, which means composite recording mode.
body	body	JSON Object	true	updateLayout-request
200 Response
​
1{
2  "cname": "string",
3  "uid": "string",
4  "resourceId": "string",
5  "sid": "string"
6}
Response
​
status	Description	Schema
200	If the returned HTTP status code is 200, the request is successful.	Response Schema
Not 200	If the HTTP status code is not 200, see the response status code for troubleshooting.	Response status code
Response Schema
​
Status Code 200

Name	Type	Required	Description
cname	String	false	The name of the channel to be recorded.
uid	String	false	The user ID used by the cloud recording service in the RTC channel to identify the recording service in the channel.
resourceId	String	false	The resource ID used by cloud recording.
sid	String	false	The recording ID, identifying a recording cycle.
query
​
Query the status of cloud recording.

GET /v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/sid/{sid}/mode/{mode}/query

After you start recording, call query to query the recording status.

info
The query request is only valid within a session. If the recording was started incorrectly, or if the recording has ended, the query call returns 404.

Parameters
​
Name	In	Type	Required	Description
Content-Type	header	String	false	application/json.
appid	path	String	true	The App ID for your project.
For web page recording mode, simply enter the App ID for which the cloud recording service is enabled.
For individual and composite recording modes, use the same App ID as for the channel to be recorded. Ensure that the cloud recording service has been enabled for this App ID.
resourceId	path	String	true	The resource ID obtained using the acquire request.
sid	path	String	true	The recording ID obtained through start.
mode	path	String	true	One of the following recording modes:
individual: Individual recording mode.
mix: Composite recording mode.
web: Web page recording mode.
200 Response
​
1{
2  "resourceId": "string",
3  "sid": "string",
4  "serverResponse": {
5    "status": 0,
6    "extensionServiceState": [
7      {
8        "payload": {
9          "fileList": [
10            {
11              "filename": "string",
12              "sliceStartTime": 0
13            }
14          ],
15          "onhold": true,
16          "state": "string"
17        },
18        "serviceName": "string"
19      }
20    ]
21  },
22  "cname": "string",
23  "uid": "string"
24}
Response
​
status	Description	Schema
200	If the returned HTTP status code is 200, the request is successful.	query-response
Not 200	If the HTTP status code is not 200, see the response status code for troubleshooting.	Response status code
stop
​
Stop cloud recording.

POST /v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/sid/{sid}/mode/{mode}/stop

After starting recording, call the stop method to leave the channel and stop recording. To start recording again after the recording has stopped, call the acquire method again to request a new resource ID.

info
The stop request is only valid within a session. If the recording is started incorrectly, or if the recording has ended, the stop call returns 404.

In non-web page recording mode, when the channel is idle (without users) for more than the predefined duration (default is 30 seconds), cloud recording automatically leaves the channel and stops recording.

Request body
​
1{
2  "cname": "httpClient463224",
3  "uid": "527841",
4  "clientRequest": {
5    "async_stop": false
6  }
7}
Parameters
​
Name	In	Type	Required	Description
Content-Type	header	String	false	application/json.
appid	path	String	true	The App ID for your project.
For web page recording mode, simply enter the App ID for which the cloud recording service is enabled.
For individual and composite recording modes, use the same App ID as for the channel to be recorded. Ensure that the cloud recording service has been enabled for this App ID.
resourceId	path	String	true	The resource ID obtained using the acquire request.
sid	path	String	true	The recording ID obtained through start.
mode	path	String	true	One of the following recording modes:
individual: Individual recording mode.
mix: Composite recording mode.
web: Web page recording mode.
body	body	JSON Object	true	stop-request
200 Response
​
1{
2  "resourceId": "string",
3  "sid": "string",
4  "serverResponse": {
5    "extensionServiceState": [
6      {
7        "playload": {
8          "uploadingStatus": "string"
9        },
10        "serviceName": "string"
11      }
12    ]
13  },
14  "cname": "string",
15  "uid": "string"
16}
Response
​
status	Description	Schema
200	If the returned HTTP status code is 200, the request is successful.	stop-response
Not 200	If the HTTP status code is not 200, see the response status code for troubleshooting.	Response status code
get-ncs-ip
​
Query the IP addresses of the message notification server.

GET /v1/ncs/ip

Query the IP address or IP address list of the message notification server.

After you enable the message notification service, the Agora message notification service can notify your server of events that occur during a cloud recording with HTTP requests. Agora dynamically adjusts the IP addresses of the message notification server every 24 hours. Query the IP addresses using this method. After the query, add the IP address (or IP address list) to the whitelist.

info
Best practice is to query the IP addresses at least once every 24 hours and automatically update the firewall configuration to avoid interruption in the reception of notifications.

1{
2  "data": {
3    "service": {
4      "hosts": [
5        {
6          "primaryIP": "xxx.xxx.xxx.xxx"
7        },
8        {
9          "primaryIP": "xxx.xxx.xxx.xxx"
10        }
11      ]
12    }
13  }
14}
Response
​
status	Description	Schema
200	If the returned HTTP status code is 200, the request is successful. You only need to pay attention to the PrimaryIP field in the response body, but not the response header or other fields in the response body.	Response Schema
Response Schema
​
Status Code 200

Name	Type	Required	Description
data	Object	false	Unnecessary to know.
» service	Object	false	Unnecessary to know.
»» hosts	Array[object]	false	Unnecessary to know.
»»» primaryIP	String	false	The IP address of the Agora message notification server.
Schemas
​
acquire-request
​
1{
2  "cname": "string",
3  "uid": "string",
4  "clientRequest": {
5    "scene": 0,
6    "resourceExpiredHour": 72,
7    "startParameter": {
8      "token": "string",
9      "storageConfig": {
10        "vendor": 0,
11        "region": 0,
12        "bucket": "string",
13        "accessKey": "string",
14        "secretKey": "string",
15        "fileNamePrefix": [
16          "string"
17        ],
18        "extensionParams": {
19          "sse": "string",
20          "tag": "string"
21        }
22      },
23      "recordingConfig": {
24        "channelType": 0,
25        "decryptionMode": 0,
26        "secret": "string",
27        "salt": "string",
28        "maxIdleTime": 30,
29        "streamTypes": 2,
30        "videoStreamType": 0,
31        "subscribeAudioUids": [
32          "string"
33        ],
34        "unsubscribeAudioUids": [
35          "string"
36        ],
37        "subscribeVideoUids": [
38          "string"
39        ],
40        "unsubscribeVideoUids": [
41          "string"
42        ],
43        "subscribeUidGroup": 0,
44        "streamMode": "default",
45        "audioProfile": 0,
46        "transcodingConfig": {
47          "width": 360,
48          "height": 640,
49          "fps": 15,
50          "bitrate": 500,
51          "maxResolutionUid": "string",
52          "mixedVideoLayout": 0,
53          "backgroundColor": "#000000",
54          "backgroundImage": "string",
55          "defaultUserBackgroundImage": "string",
56          "layoutConfig": [
57            {
58              "uid": "string",
59              "x_axis": 1,
60              "y_axis": 1,
61              "width": 1,
62              "height": 1,
63              "alpha": 1,
64              "render_mode": 0
65            }
66          ],
67          "backgroundConfig": [
68            {
69              "uid": "string",
70              "image_url": "string",
71              "render_mode": 0
72            }
73          ]
74        }
75      },
76      "recordingFileConfig": {
77        "avFileType": [
78          "hls"
79        ]
80      },
81      "snapshotConfig": {
82        "captureInterval": 10,
83        "fileType": [
84          "jpg"
85        ]
86      },
87      "extensionServiceConfig": {
88        "errorHandlePolicy": "error_abort",
89        "extensionServices": [
90          {
91            "serviceName": "string",
92            "errorHandlePolicy": "string",
93            "serviceParam": {
94              "url": "string",
95              "audioProfile": 0,
96              "videoWidth": 240,
97              "videoHeight": 240,
98              "maxRecordingHour": 1,
99              "videoBitrate": 0,
100              "videoFps": 15,
101              "mobile": false,
102              "maxVideoDuration": 120,
103              "onhold": false,
104              "readyTimeout": 0
105            }
106          }
107        ]
108      },
109    },
110    "excludeResourceIds": [
111      "string"
112    ]
113  }
114}
Properties
​
Name	Type	Required	Description
cname	String	true	Channel name:
- For individual recording and composite recording modes, this field is used to set the name of the channel to be recorded.
- For web page recording mode, this field is used to differentiate the recording process. The string length cannot exceed 1024 bytes.
Note: A unique recording instance can be located through appid, cname, and uid. Therefore, if you intend to record the same channel multiple times, use the same appId and cname, while differentiating them with different uids.
uid	String	true	The string contains the UID used by the cloud recording service within the channel to identify the recording service, for example, "527841". The string must meet the following conditions:
- The value is in the range from 1 to (232-1), and cannot be set to 0.
- It must not duplicate any UID within the current channel.
- The field value within the quotation marks is an integer UID, and all users in the channel should use integer UIDs.
clientRequest	Object	false	See the following.
» scene	Number	false	Use cases for cloud recording resources:
- 0: (default) Real-time audio and video recording.
- 1: Web page recording.
» resourceExpiredHour	Number	false	The validity period for calling the cloud recording RESTful API. Start calculating after you successfully initiate the cloud recording service and obtain the sid (Recording ID). The calculation unit is hours. The value range is [1,720]. The default value is 72.

Note: After the timeout, you will not be able to call the query, update, updateLayout, and stop methods.
» startParameter	client-request	false	Setting this field can improve availability and optimize load balancing.

Note: When populating the startParameter object, make sure the values are valid and consistent with the clientRequest object in the subsequent start request body; otherwise, the start request will receive an error response.
» excludeResourceIds	Array[string]	false	The resourceId of another or several other recording tasks. This field is used to exclude specified recording resources so that newly initiated recording tasks can use resources from a new region, enabling cross-regional multi-stream recording. See Multi-channel task assurance.
» region	String	false	Specify regions that the cloud recording service can access. By default, the cloud recording service accesses the region where the server you initiated the request is located. Once you specify the access region through region, the cloud recording service will not access servers outside the specified region. The region can be set to:
- "CN": Mainland China
- "AP": Asia excluding Mainland China
- "EU": Europe
- "NA": North America
Note: When calling the start method, the region of the third-party cloud storage must be consistent with this field.
client-request
​
1{
2  "token": "string",
3  "storageConfig": {
4    "vendor": 0,
5    "region": 0,
6    "bucket": "string",
7    "accessKey": "string",
8    "secretKey": "string",
9    "fileNamePrefix": [
10      "string"
11    ],
12    "extensionParams": {
13      "sse": "string",
14      "tag": "string"
15    }
16  },
17  "recordingConfig": {
18    "channelType": 0,
19    "decryptionMode": 0,
20    "secret": "string",
21    "salt": "string",
22    "maxIdleTime": 30,
23    "streamTypes": 2,
24    "videoStreamType": 0,
25    "subscribeAudioUids": [
26      "string"
27    ],
28    "unsubscribeAudioUids": [
29      "string"
30    ],
31    "subscribeVideoUids": [
32      "string"
33    ],
34    "unsubscribeVideoUids": [
35      "string"
36    ],
37    "subscribeUidGroup": 0,
38    "streamMode": "default",
39    "audioProfile": 0,
40    "transcodingConfig": {
41      "width": 360,
42      "height": 640,
43      "fps": 15,
44      "bitrate": 500,
45      "maxResolutionUid": "string",
46      "mixedVideoLayout": 0,
47      "backgroundColor": "#000000",
48      "backgroundImage": "string",
49      "defaultUserBackgroundImage": "string",
50      "layoutConfig": [
51        {
52          "uid": "string",
53          "x_axis": 1,
54          "y_axis": 1,
55          "width": 1,
56          "height": 1,
57          "alpha": 1,
58          "render_mode": 0
59        }
60      ],
61      "backgroundConfig": [
62        {
63          "uid": "string",
64          "image_url": "string",
65          "render_mode": 0
66        }
67      ]
68    }
69  },
70  "recordingFileConfig": {
71    "avFileType": [
72      "hls"
73    ]
74  },
75  "snapshotConfig": {
76    "captureInterval": 10,
77    "fileType": [
78      "jpg"
79    ]
80  },
81  "extensionServiceConfig": {
82    "errorHandlePolicy": "error_abort",
83    "extensionServices": [
84      {
85        "serviceName": "string",
86        "errorHandlePolicy": "string",
87        "serviceParam": {
88          "url": "string",
89          "audioProfile": 0,
90          "videoWidth": 240,
91          "videoHeight": 240,
92          "maxRecordingHour": 1,
93          "videoBitrate": 0,
94          "videoFps": 15,
95          "mobile": false,
96          "maxVideoDuration": 120,
97          "onhold": false,
98          "readyTimeout": 0
99        }
100      }
101    ]
102  },
103}
Properties
​
Name	Type	Required	Description
token	String	false	A dynamic key used for authentication. If your project has enabled the App certificate, pass in the dynamic key of your project in this field. See Token Authentication for details.
Note:
You only need to set the authentication token in individual recording and composite recording modes.

Cloud recording service does not support updating tokens currently. To ensure normal recording, ensure that the effective duration of the token is longer than your expected recording time, to avoid the token expiring and causing the recording task to exit the channel and end the recording.

storageConfig	storageConfig	true	Configuration for third-party cloud storage.
recordingConfig	recordingConfig	false	Configuration for recorded audio and video streams.
Note: You only need to set this field in individual recording and composite recording modes.
recordingFileConfig	recordingFileConfig	false	Configuration for recorded files.
Note: This field cannot be set when only taking screenshots, but it needs to be set in all other cases. Other cases include the following:
Recording without transcoding, recording with transcoding, or recording and taking screenshots simultaneously in individual recording mode.

Composite recording.

In the web page recording mode, you can do page recording only, or simultaneously do the page recording and push it to the CDN.

snapshotConfig	snapshotConfig	false	Configurations for screenshot capture.
Note: Only need to set this field when using the screenshot function in individual recording mode.
Screenshot usage instructions:
- The screenshot function is only applicable to individual recording mode (individual).
- You can either take screenshots in an individual recording process, or record and take screenshots at the same time. For more information, see Capture Screenshots. The use-case of simultaneous recording and screenshot capture requires setting the recordingFileConfig field.
- If the recording service or recording upload service is abnormal, the screenshot will fail. Recording is not affected when there is a screenshot exception.
- streamTypes must be set as 1 or 2 when capturing screenshots. If you have set subscribeAudioUid, you must also set subscribeVideoUids.
extensionServiceConfig	extensionServiceConfig	false	Configurations for extended services.
Note: Only need to set in web page recording mode.
storageConfig
​
1{
2  "vendor": 0,
3  "region": 0,
4  "bucket": "string",
5  "accessKey": "string",
6  "secretKey": "string",
7  "fileNamePrefix": [
8    "string"
9  ],
10  "extensionParams": {
11    "sse": "string",
12    "tag": "string"
13  }
14}
Configurations for third-party cloud storage.

Properties
​
Name	Type	Required	Description
vendor	Number	true	Third-party cloud storage platforms.
- 1: Amazon S3
- 2: Alibaba Cloud
- 3: Tencent Cloud
- 5: Microsoft Azure
- 6: Google Cloud
- 7: Huawei Cloud
- 8: Baidu IntelligentCloud
- 11: S3 compatible storage. Specify the domain name of the self-built cloud storage in the extensionParams.endpoint field.
region	Number	true	The region information specified for the third-party cloud storage.

Note: To ensure the success rate and real-time performance of the upload of the recording file, the region of the third-party cloud storage must be the same as the region of the application server where you initiate the request. For example: If the App server from which you initiate the request is in mainland China, and meanwhile the third-party cloud storage needs to be set to a region within mainland China. See Third-party cloud storage regions.
bucket	String	true	Third-party cloud storage bucket. The bucket name needs to comply with the naming rules of the corresponding third-party cloud storage service.
accessKey	String	true	Access Key for third-party cloud storage.
secretKey	String	true	(Required) The secret key of the third-party cloud storage.
stsToken	String	false	A temporary security token for third-party cloud storage. This token is issued by the cloud service provider's Security Token Service (STS) and used to grant limited access rights to third-party cloud storage resources.
Note
Currently supported cloud service providers include only the following: 1: Amazon S3, 2: Alibaba Cloud, 3: Tencent Cloud.
stsExpiration	Number	false	The stsToken expiration timestamp used to mark UNIX time, in seconds.
Note
To avoid timestamp overflow, use Uint64 storage.
Set the longest possible validity period when applying the stsToken. The validity period must be at least 4 hours. Call update to update the stsToken value before it expires.
If the recording task lasts for more than 1 hour, reapply a new stsToken every 60 minutes and call update to update the relevant parameters in storageConfig
fileNamePrefix	Array[string]	false	The storage location of the recorded files in the third-party cloud is related to the prefix of the file name. If it is set to ["directory1","directory2"], then the prefix of the recording file name is "directory1/directory2/", that is, the recording file name is directory1/directory2/xxx.m3u8. The prefix's length, including the slashes, should not exceed 128 characters. The string itself should not contain symbols such as slash, underscore, or parenthesis. The following are the supported character set ranges:
- 26 lowercase English letters: a-z
- 26 uppercase English letters: A-Z
- 10 numbers: 0-9
extensionParams	extensionParams	false	Third-party cloud storage services will encrypt and tag the uploaded recording files according to this field.
extensionParams
​
1{
2  "sse": "string",
3  "tag": "string"
4}
Third-party cloud storage services will encrypt and tag the uploaded recording files according to this field.

Properties
​
Name	Type	Required	Description
sse	String	true	The encryption mode. After setting this field, the third-party cloud storage service will encrypt the uploaded recording files according to this encryption mode. This field is only applicable to Amazon S3, see the official Amazon S3 documentation.
- kms: KMS encryption.
- aes256: AES256 encryption.
tag	String	true	Tag content. After setting this field, the third-party cloud storage service will tag the uploaded recording files according to the content of this tag. This field is only applicable to Alibaba Cloud and Amazon S3. For details, see the Alibaba Cloud official documentation and the Amazon S3 official documentation.
recordingConfig
​
1{
2  "channelType": 0,
3  "decryptionMode": 0,
4  "secret": "string",
5  "salt": "string",
6  "maxIdleTime": 30,
7  "streamTypes": 2,
8  "videoStreamType": 0,
9  "subscribeAudioUids": [
10    "string"
11  ],
12  "unsubscribeAudioUids": [
13    "string"
14  ],
15  "subscribeVideoUids": [
16    "string"
17  ],
18  "unsubscribeVideoUids": [
19    "string"
20  ],
21  "subscribeUidGroup": 0,
22  "streamMode": "default",
23  "audioProfile": 0,
24  "transcodingConfig": {
25    "width": 360,
26    "height": 640,
27    "fps": 15,
28    "bitrate": 500,
29    "maxResolutionUid": "string",
30    "mixedVideoLayout": 0,
31    "backgroundColor": "#000000",
32    "backgroundImage": "string",
33    "defaultUserBackgroundImage": "string",
34    "layoutConfig": [
35      {
36        "uid": "string",
37        "x_axis": 1,
38        "y_axis": 1,
39        "width": 1,
40        "height": 1,
41        "alpha": 1,
42        "render_mode": 0
43      }
44    ],
45    "backgroundConfig": [
46      {
47        "uid": "string",
48        "image_url": "string",
49        "render_mode": 0
50      }
51    ]
52  }
53}
Configurations for recorded audio and video streams.
Note: You only need to set this field in individual recording and composite recording modes.

Properties
​
Name	Type	Required	Description
channelType	Number	true	The channel profile.
- 0: (Default) The communication use-case.
- 1: Live streaming scene.
The channel scene must be consistent with the Agora RTC SDK, otherwise it may cause issues.
decryptionMode	Number	false	The decryption mode. If you have set channel encryption in the SDK client, you need to set the same decryption mode for the cloud recording service.
- 0: (Default) Not encrypted.
- 1: AES_128_XTS encryption mode. 128-bit AES encryption, XTS mode.
- 2: AES_128_ECB encryption mode. 128-bit AES encryption, ECB mode.
- 3: AES_256_XTS encryption mode. 256-bit AES encryption, XTS mode.
- 4: SM4_128_ECB encryption mode. 128-bit SM4 encryption, ECB mode.
- 5: AES_128_GCM encryption mode. 128-bit AES encryption, GCM mode.
- 6: AES_256_GCM encryption mode. 256-bit AES encryption, GCM mode.
- 7: AES_128_GCM2 encryption mode. 128-bit AES encryption, GCM mode. Compared to AES_128_GCM encryption mode, AES_128_GCM2 encryption mode has higher security and requires setting a key and salt.
- 8: AES_256_GCM2 encryption mode. 256-bit AES encryption, GCM mode. Compared to the AES_256_GCM encryption mode, the AES_256_GCM2 encryption mode is more secure and requires setting a key and salt.
secret	String	false	Keys related to encryption and decryption. Only needs to be set when decryptionMode is not 0.
salt	String	false	Salt related to encryption and decryption. Base64 encoding, 32-bit bytes. Only need to set when decryptionMode is 7 or 8.
maxIdleTime	Number	false	Maximum channel idle time. The unit is seconds. The value range is [5,2592000]. The default value is 30. The maximum value can not exceed 30 days. The recording service will automatically exit after exceeding the maximum channel idle time. After the recording service exits, if you initiate a start request again, a new recording file will be generated.
Channel idle: There are no broadcasters in the live channel, or there are no users in the communication channel.
streamTypes	Number	false	Subscribed media stream type.
- 0: Subscribes to audio streams only. Suitable for smart voice review use-cases.
- 1: Subscribes to video streams only.
- 2: (Default) Subscribes to both audio and video streams.
videoStreamType	Number	false	Sets the stream type of the remote video. If you enable dual-stream mode in the SDK client, you can choose to subscribe to either the high-quality video stream or the low-quality video stream.
- 0: High-quality video stream refers to high-resolution and high-bitrate video stream.
- 1: Low-quality video stream refers to low-resolution and low-bitrate video stream.
subscribeAudioUids	Array[string]	false	Specify which UIDs' audio streams to subscribe to. If you want to subscribe to the audio stream of all UIDs, no need to set this field. The array length should not exceed 32, and using an empty array is not recommended. Only one of the fields can be set: this field or unsubscribeAudioUids. For details, see Set up subscription lists.
Note:
This field is only applicable when the streamTypes field is set to audio, or both audio and video.

If you have set up a subscription list for audio or video only, but not at the same time, then the cloud recording service will not subscribe to any video streams. If you set up a subscription list for video, but not for audio, then Agora Cloud Recording will not subscribe to any audio streams.

Set as ["#allstream#"] to subscribe to the audio streams of all UIDs in the channel.

unsubscribeAudioUids	Array[string]	false	Specify which UIDs' audio streams not to subscribe to. The cloud recording service will subscribe to the audio streams of all other UIDs except the specified ones. The array length should not exceed 32, and using an empty array is not recommended. Only one of the fields can be set: this field or subscribeAudioUids. For details, see Set up subscription lists.
subscribeVideoUids	Array[string]	false	Specify which UID's video streams to subscribe to. If you want to subscribe to the video streams of all UIDs, no need to set this field. The array length should not exceed 32, and using an empty array is not recommended. Only one of the fields can be set: this field or unsubscribeVideoUids. For details, see Set up subscription lists.
Note:
This field is only applicable when the streamTypes field is set to video, or both audio and video.

If you have set up a subscription list for audio or video only, but not at the same time, then the cloud recording service will not subscribe to any video streams. If you set up a subscription list for video, but not for audio, then Agora Cloud Recording will not subscribe to any audio streams.

Set as ["#allstream#"] to subscribe to the video streams of all UIDs in the channel.

unsubscribeVideoUids	Array[string]	false	Specify which UIDs' audio streams not to subscribe to. The cloud recording service will subscribe to the video streams of all UIDs except the specified ones. The array length should not exceed 32, and using an empty array is not recommended. Only one of the fields can be set: this field or subscribeVideoUids. For details, see Set up subscription lists.
subscribeUidGroup	Number	false	Estimated peak number of subscribers.
- 0: 1 to 2 UIDs.
- 1:3 to 7 UIDs.
- 2: 8 to 12 UIDs
- 3: 13 to 17 UIDs
- 4: 18 to 32 UIDs.
- 5: 33 to 49 UIDs.
Note:
- Only need to be set in individual recordingmode, and it is required in this mode.
- For example, if subscribeVideoUids is ["100","101","102"] and subscribeAudioUids is ["101","102","103"], the number of subscribers is 4.
streamMode	String	false	Output mode of media stream. See Media streaming output modes.
- "default": Default mode. Recording with audio transcoding will separately generate an M3U8 audio index file and a video index file.
- "standard": Standard mode. Agora recommends using this mode. Recording with audio transcoding will separately generate an M3U8 audio index file, a video index file, and a merged audio and video index file. If VP8 encoding is used on the Web client, a merged MPD audio-video index file will be generated.
- "original": Original encoding mode. It is applicable to individual non-transcoding audio recording. This field only takes effect when subscribing to audio only (streamTypes is 0). During the recording process, the audio is not transcoded, and an M3U8 audio index file is generated.
Note: Only need to set in individual recording mode.
audioProfile	Number	false	Set the sampling rate, bitrate, encoding mode, and number of channels for the output audio.
- 0: (Default) 48 kHz sampling rate, music encoding, mono audio channel, and the encoding bitrate is about 48 Kbps.
1: 48 kHz sampling rate, music encoding, mono audio channel, and the encoding bitrate is approximately 128 Kbps.
2: 48 kHz sampling rate, music encoding, stereo audio channel, and the encoding bitrate is approximately 192 Kbps.
Note: Only need to set in the composite recording mode.
transcodingConfig	transcodingConfig	false	Configurations for transcoded video output The value can refer to Setting the Resolution of the Recorded Video Output.
Note: Only need to set in the composite recording mode.
transcodingConfig
​
1{
2  "width": 360,
3  "height": 640,
4  "fps": 15,
5  "bitrate": 500,
6  "maxResolutionUid": "string",
7  "mixedVideoLayout": 0,
8  "backgroundColor": "#000000",
9  "backgroundImage": "string",
10  "defaultUserBackgroundImage": "string",
11  "layoutConfig": [
12    {
13      "uid": "string",
14      "x_axis": 1,
15      "y_axis": 1,
16      "width": 1,
17      "height": 1,
18      "alpha": 1,
19      "render_mode": 0
20    }
21  ],
22  "backgroundConfig": [
23    {
24      "uid": "string",
25      "image_url": "string",
26      "render_mode": 0
27    }
28  ]
29}
Configurations for transcoded video output The value can refer to Setting the Resolution of the Recorded Video Output.
Note: Only need to set in the composite recording mode.

Properties
​
Name	Type	Required	Description
width	Number	false	The width of the video (pixels). width × height cannot exceed 1920 × 1080. The default value is 360.
height	Number	false	The height of the video (pixels). width × height cannot exceed 1920 × 1080. The default value is 640.
fps	Number	false	The frame rate of the video (fps). The default value is 15.
bitrate	Number	false	The bitrate of the video (Kbps). The default value is 500.
maxResolutionUid	String	false	Only need to set it in vertical layout. Specify the user ID of the large video window. The string value should be an integer ranging from 1 to (232-1), and cannot be set to 0.
mixedVideoLayout	Number	false	Composite video layout:
- 0: (Default) Floating layout. The first user to join the channel will be displayed as a large window, filling the entire canvas. The video windows of other users will be displayed as small windows, arranged horizontally from bottom to top, up to 4 rows, each with 4 windows. It supports up to a total of 17 windows of different users' videos.
- 1: Adaptive layout. Automatically adjust the size of each user's video window according to the number of users, each user's video window size is consistent, and supports up to 17 windows.
- 2: Vertical layout. The maxResolutionUid is specified to display the large video window on the left side of the screen, and the small video windows of other users are vertically arranged on the right side, with a maximum of two columns, 8 windows per column, supporting up to 17 windows.
- 3: Customized layout. Set the layoutConfig field to customize the mixed layout.
backgroundColor	String	false	The background color of the video canvas. The RGB color table is supported, with strings formatted as a # sign and 6 hexadecimal digits. The default value is "#000000", representing the black color.
backgroundImage	String	false	The URL of the background image of the video canvas. The display mode of the background image is set to cropped mode.
Cropped mode: Will prioritize to ensure that the screen is filled. The background image size is scaled in equal proportion until the entire screen is filled with the background image. If the length and width of the background image differ from the video window, the background image will be peripherally cropped to fill the window.
defaultUserBackgroundImage	String	false	The URL of the default user screen background image.
After configuring this field, when any user stops sending the video streams for more than 3.5 seconds, the screen will switch to the background image; this setting will be overridden if the background image is set separately for a UID.
layoutConfig	Array[object]	false	layoutConfig
backgroundConfig	backgroundConfig	false	Configurations of user's background image.
layoutConfig
​
1[
2  {
3    "uid": "string",
4    "x_axis": 1,
5    "y_axis": 1,
6    "width": 1,
7    "height": 1,
8    "alpha": 1,
9    "render_mode": 0
10  }
11]
The mixed video layout of users. An array of screen layout settings for each user, supporting up to 17 users.
Note: Only need to set in custom layout.

Properties
​
Name	Type	Required	Description
uid	String	false	The content of the string is the UID of the user to be displayed in the area, 32-bit unsigned integer.
If the UID is not specified, the screen settings in layoutConfig will be matched automatically in the order that users join the channel.
x_axis	Number(float)	true	The relative value of the horizontal coordinate of the upper-left corner of the screen, accurate to six decimal places. Layout from left to right, with 0.0 at the far left and 1.0 at the far right. This field can also be set to the integer 0 or 1. The value range is [0,1].
y_axis	Number(float)	true	The relative value of the vertical coordinate of the upper-left corner of this screen in the screen, accurate to six decimal places. Layout from top to bottom, with 0.0 at the top and 1.0 at the bottom. This field can also be set to the integer 0 or 1. The value range is [0,1].
width	Number(float)	true	The relative value of the width of this screen, accurate to six decimal places. This field can also be set to the integer 0 or 1. The value range is [0,1].
height	Number(float)	true	The relative value of the height of this screen, accurate to six decimal places. This field can also be set to the integer 0 or 1. The value range is [0,1].
alpha	Number(float)	false	The transparency of the user's video window. Accurate to six decimal places. 0.0 means the user's video window is transparent, and 1.0 indicates that it is completely opaque. The value range is [0,1]. The default value is 1.
render_mode	Number	false	The display mode of users' video windows:
- 0: (Default) cropped mode. Prioritize to ensure the screen is filled. The video window size is proportionally scaled until it fills the screen. If the video's length and width differ from the video window, the video stream will be cropped from its edges to fit the window, under the aspect ratio set for the video window.
- 1: Fit mode. Prioritize to ensure that all video content is displayed. The video size is scaled proportionally until one side of the video window is aligned with the screen border. If the video scale does not comply with the window size, the video will be scaled to fill the screen while maintaining its aspect ratio. This scaling may result in a black border around the edges of the video.
backgroundConfig
​
1[
2  {
3    "uid": "string",
4    "image_url": "string",
5    "render_mode": 0
6  }
7]
Configurations of user's background image.

Properties
​
Name	Type	Required	Description
uid	String	true	The string content is the UID.
image_url	String	true	The URL of the user's background image. After setting the background image, if the user stops sending the video stream for more than 3.5 seconds, the screen will switch to the background image.

URL supports the HTTPS protocol, and the image formats supported are JPG and BMP. The image size must not exceed 6 MB. The settings will only take effect after the recording service successfully downloads the image; if the download fails, the settings will not take effect. Different field settings may overlap each other. For specific rules, see Set the background color or background image.
render_mode	Number	false	The display mode of users' video windows:
- 0: (Default) cropped mode. Prioritize to ensure the screen is filled. The video window size is proportionally scaled until it fills the screen. If the video's length and width differ from the video window, the video stream will be cropped from its edges to fit the window, under the aspect ratio set for the video window.
- 1: Fit mode. Prioritize to ensure that all video content is displayed. The video size is scaled proportionally until one side of the video window is aligned with the screen border. If the video scale does not comply with the window size, the video will be scaled to fill the screen while maintaining its aspect ratio. This scaling may result in a black border around the edges of the video.
recordingFileConfig
​
1{
2  "avFileType": [
3    "hls"
4  ]
5}
Name	Type	Required	Description
avFileType	Array[string]	false	Type of video files generated by recording:
- "hls": default value. M3U8 and TS files.
- "mp4": MP4 files.
Note:
- In individual recording mode and not in screenshot-only case, you can use the default value.
- In the composite recording and web page recording modes, if you need to generate MP4 files, set it to ["hls","mp4"]. Setting it as ["mp4"] will result in an error. After setting, the recording file behavior is as follows:
- In the composite recording mode, the recording service will create a new MP4 file when the current recording duration exceeds about 2 hours or the file size roughly exceeds 2 GB.
- Web page recording mode: The recording service will create a new MP4 file when the current file's duration exceeds maxVideoDuration.
snapshotConfig
​
1{
2  "captureInterval": 10,
3  "fileType": [
4    "jpg"
5  ]
6}
Properties
​
Name	Type	Required	Description
captureInterval	Number	false	The cycle for regular screenshots in the cloud recording. The unit is seconds. The value range is [5,3600]. The default value is 10.
fileType	Array[string]	true	The file format of screenshots. Currently only ["jpg"] is supported, which generates screenshot files in JPG format.
extensionServiceConfig
​
1{
2  "errorHandlePolicy": "error_abort",
3  "extensionServices": [
4    {
5      "serviceName": "string",
6      "errorHandlePolicy": "string",
7      "serviceParam": {
8        "url": "string",
9        "audioProfile": 0,
10        "videoWidth": 240,
11        "videoHeight": 240,
12        "maxRecordingHour": 1,
13        "videoBitrate": 0,
14        "videoFps": 15,
15        "mobile": false,
16        "maxVideoDuration": 120,
17        "onhold": false,
18        "readyTimeout": 0
19      }
20    }
21  ]
22}
Configurations for extended services.
Note: Only need to set in web page recording mode.

Properties
​
Name	Type	Required	Description
errorHandlePolicy	String	false	Error handling policy. You can only set it to the default value, "error_abort", which means that once an error occurs to an extension service, all other non-extension services, such as stream subscription, also stop.
extensionServices	Array[object]	true	See the following.
» serviceName	String	true	Name of the extended service:
- web_recorder_service: Represents the extended service is web page recording.
- rtmp_publish_service: Represents the extended service is to push web page recording to the CDN.
» errorHandlePolicy	String	false	Error handling strategy within the extension service:
- "error_abort": the default and only value during web page recording. Stop other extension services when the current extension service encounters an error.
- "error_ignore": The only default value when you push the web page recording to the CDN. Other extension services are not affected when the current extension service encounters an error.
If the web page recording service or the recording upload service is abnormal, pushing the stream to the CDN will fail. Therefore, errors in the web page recording service can affect the service of pushing page recording to the CDN.
When an exception occurs during the process of pushing to the CDN, web page recording is not affected.
» serviceParam	serviceParam	true	Specific configurations for extension services.
serviceParam
​
1{
2  "url": "string",
3  "audioProfile": 0,
4  "videoWidth": 240,
5  "videoHeight": 240,
6  "maxRecordingHour": 1,
7  "videoBitrate": 0,
8  "videoFps": 15,
9  "mobile": false,
10  "maxVideoDuration": 120,
11  "onhold": false,
12  "readyTimeout": 0
13}
Properties
​
Use-case 1
​
Set the following fields for web page recording:

Name	Type	Required	Description
url	String	true	The address of the page to be recorded.
audioProfile	Number	true	Sampling rate, bitrate, encoding mode, and number of channels for the audio output.
0: 48 kHz sampling rate, music encoding, mono audio channel, and the encoding bitrate is approximately 48 Kbps.
1: 48 kHz sampling rate, music encoding, mono audio channel, and the encoding bitrate is approximately 128 Kbps.
2: 48 kHz sampling rate, music encoding, stereo audio channel, and the encoding bitrate is approximately 192 Kbps.
videoWidth	Number	true	The output video width (pixel). The product of videoWidth and videoHeight should be less than or equal to 1920 × 1080. For recommended values, see How can I set the page recording output resolution in mobile web page mode?.
videoHeight	Number	true	The height of the output video (pixel). The product of videoWidth and videoHeight should be less than or equal to 1920 × 1080. For recommended values, see How can I set the page recording output resolution in mobile web page mode.
maxRecordingHour	Number	true	The maximum duration of web page recording (hours). The web page recording will automatically stop after exceeding this value. The value range is [1,720].
> The recommended value should not exceed the value you set in the acquire method for resourceExpiredHour.
Billing related: The charge will continue until the web page recording stops, so you need to set a reasonable value according to the actual business situation or stop the page recording voluntarily.
videoBitrate	Number	false	The bitrate of the output video (Kbps). For different output video resolutions, the default value of videoBitrate is different:
- Output video resolution is greater than or equal to 1280 × 720, and the default value is 2000.
- Output video resolution is less than 1280 × 720, and the default value is 1500.
videoFps	Number	false	The frame rate of the output video (fps). The value range is [5,60]. The default value is 15.
mobile	Boolean	false	Whether to enable the mobile web mode:
- true: Enables the mode. After enabling, the recording service uses the mobile web rendering mode to record the current page.
- false: (default) Disables the mode.
maxVideoDuration	Number	false	Maximum length of MP4 slice file generated by web page recording, in minutes During the web page recording process, the recording service will create a new MP4 slice file when the current MP4 file duration exceeds the maxVideoDuration approximately. The value range is [30,240]. The default value is 120.
onhold	Boolean	false	Whether to pause page recording when starting a web page recording task.
- true: Pauses the web page recording that has been started. Immediately pause the recording after starting the web page recording task. The recording service will open and render the page to be recorded, but will not generate slice files.
- false: (Default) Starts a web page recording task and performs web page recording.
We suggest using the onhold field according to the following process:
1. Set onhold to true when calling the start method, which will start and pause the web page recording, and you need to determine the appropriate time to start the web page recording on your own.
2. Call update and set onhold to false, continue with the web page recording. If you need to pause or resume the web page recording by continuously calling the update method, please make the call after receiving the response from the previous update, otherwise it may cause inconsistent results with your expectations.
readyTimeout	Number	false	Set the page load timeout in seconds. See Page Load Timeout Detection. The value range is [0,60]. The default value is 0.
- Set to 0 or not set, which means the web page loading status is not detected.
-An integer between [1,60], representing the page load timeout.
Use-case 2
​
Pushing web page recording to the CDN requires configuring the following fields.

Name	Type	Required	Description
outputs	Array[object]	true	See the following.
» rtmpUrl	String	true	The CDN address to which you push the stream.
Properties
​
Name	Type	Required	Description
container	Object	false	See the following.
» format	String	false	The container format of the file, which supports the following values:
- "mp4": MP4 format.
- "mp3": MP3 format.
- "m4a": M4A format.
- "aac": AAC format.
» sampleRate	String	false	Audio sampling rate (Hz) supports the following values:
- "48000": (Default) 48 kHz.
- "32000": 32 kHz.
- "16000": 16 kHz.
» bitrate	String	false	Audio bit rate (Kbps) supports a customized value and the default value is "48000".
» channels	String	false	The number of audio channels supports the following values:
- "1": Mono.
- "2": (Default) Stereo.
acquire-response
​
1{
2  "cname": "string",
3  "uid": "string",
4  "resourceId": "string"
5}
Properties
​
Name	Type	Required	Description
cname	String	false	The name of the channel to be recorded.
uid	String	false	The user ID used by the cloud recording service in the RTC channel to identify the recording service in the channel.
resourceId	String	false	The cloud recording resource ID. You can start a cloud recording with this resource ID. The resource ID is valid for five minutes, after which you need to re-request it.
start-request
​
1{
2  "cname": "string",
3  "uid": "string",
4  "clientRequest": {
5    "token": "string",
6    "storageConfig": {
7      "vendor": 0,
8      "region": 0,
9      "bucket": "string",
10      "accessKey": "string",
11      "secretKey": "string",
12      "fileNamePrefix": [
13        "string"
14      ],
15      "extensionParams": {
16        "sse": "string",
17        "tag": "string"
18      }
19    },
20    "recordingConfig": {
21      "channelType": 0,
22      "decryptionMode": 0,
23      "secret": "string",
24      "salt": "string",
25      "maxIdleTime": 30,
26      "streamTypes": 2,
27      "videoStreamType": 0,
28      "subscribeAudioUids": [
29        "string"
30      ],
31      "unsubscribeAudioUids": [
32        "string"
33      ],
34      "subscribeVideoUids": [
35        "string"
36      ],
37      "unsubscribeVideoUids": [
38        "string"
39      ],
40      "subscribeUidGroup": 0,
41      "streamMode": "default",
42      "audioProfile": 0,
43      "transcodingConfig": {
44        "width": 360,
45        "height": 640,
46        "fps": 15,
47        "bitrate": 500,
48        "maxResolutionUid": "string",
49        "mixedVideoLayout": 0,
50        "backgroundColor": "#000000",
51        "backgroundImage": "string",
52        "defaultUserBackgroundImage": "string",
53        "layoutConfig": [
54          {
55            "uid": "string",
56            "x_axis": 1,
57            "y_axis": 1,
58            "width": 1,
59            "height": 1,
60            "alpha": 1,
61            "render_mode": 0
62          }
63        ],
64        "backgroundConfig": [
65          {
66            "uid": "string",
67            "image_url": "string",
68            "render_mode": 0
69          }
70        ]
71      }
72    },
73    "recordingFileConfig": {
74      "avFileType": [
75        "hls"
76      ]
77    },
78    "snapshotConfig": {
79      "captureInterval": 10,
80      "fileType": [
81        "jpg"
82      ]
83    },
84    "extensionServiceConfig": {
85      "errorHandlePolicy": "error_abort",
86      "extensionServices": [
87        {
88          "serviceName": "string",
89          "errorHandlePolicy": "string",
90          "serviceParam": {
91            "url": "string",
92            "audioProfile": 0,
93            "videoWidth": 240,
94            "videoHeight": 240,
95            "maxRecordingHour": 1,
96            "videoBitrate": 0,
97            "videoFps": 15,
98            "mobile": false,
99            "maxVideoDuration": 120,
100            "onhold": false,
101            "readyTimeout": 0
102          }
103        }
104      ]
105    },
106  }
107}
Properties
​
Name	Type	Required	Description
cname	String	true	The name of the channel where the recording service locates. The cname field you input in the acquire request needs to be the same.
uid	String	true	The string content is the UID used by the recording service in the RTC channel to identify the recording service. It needs to be the same as the uid field you input in the acquire request.
clientRequest	Object	true	client-request
update-request
​
1{
2  "cname": "string",
3  "uid": "string",
4  "clientRequest": {
5    "streamSubscribe": {
6      "audioUidList": {
7        "subscribeAudioUids": [
8          "string"
9        ],
10        "unsubscribeAudioUids": [
11          "string"
12        ]
13      },
14      "videoUidList": {
15        "subscribeVideoUids": [
16          "string"
17        ],
18        "unsubscribeVideoUids": [
19          "string"
20        ]
21      }
22    },
23    "webRecordingConfig": {
24      "onhold": false
25    },
26    "rtmpPublishConfig": {
27      "outputs": [
28        {
29          "rtmpUrl": "string"
30        }
31      ]
32    }
33  }
34}
Properties
​
Name	Type	Required	Description
cname	String	true	The name of the channel where the recording service locates. The cname field you input in the acquire request needs to be the same.
uid	String	true	The string content is the UID used by the recording service in the RTC channel to identify the recording service. It needs to be the same as the uid field you input in the acquire request.
clientRequest	Object	true	clientRequest
clientRequest
​
1{
2  "streamSubscribe": {
3    "audioUidList": {
4      "subscribeAudioUids": [
5        "string"
6      ],
7      "unsubscribeAudioUids": [
8        "string"
9      ]
10    },
11    "videoUidList": {
12      "subscribeVideoUids": [
13        "string"
14      ],
15      "unsubscribeVideoUids": [
16        "string"
17      ]
18    }
19  },
20  "webRecordingConfig": {
21    "onhold": false
22  },
23  "rtmpPublishConfig": {
24    "outputs": [
25      {
26        "rtmpUrl": "string"
27      }
28    ]
29  }
30}
Properties
​
Name	Type	Required	Description
streamSubscribe	streamSubscribe	false	Update subscription lists.
Note: You only need to set this field in individual recording and composite recording modes.
webRecordingConfig	webRecordingConfig	false	Used to update the web page recording configurations.
Note: Only need to set in web page recording mode.
rtmpPublishConfig	rtmpPublishConfig	false	Used to update the configurations for pushing web page recording to the CDN.
Note: This should only be set when you push media stream to the CDN during aweb page recording.
storageConfig	storageConfig	true	Configuration for third-party cloud storage.
streamSubscribe
​
1{
2  "audioUidList": {
3    "subscribeAudioUids": [
4      "string"
5    ],
6    "unsubscribeAudioUids": [
7      "string"
8    ]
9  },
10  "videoUidList": {
11    "subscribeVideoUids": [
12      "string"
13    ],
14    "unsubscribeVideoUids": [
15      "string"
16    ]
17  }
18}
Update subscription lists.
Note: You only need to set this field in individual recording and composite recording modes.

Properties
​
Name	Type	Required	Description
audioUidList	audioUidList	false	The audio subscription list.
Note: This field is only applicable when the streamTypes field is set to audio, or both audio and video.
videoUidList	videoUidList	false	The video subscription list.
Note: This field only applies when the streamTypes field is set to video, or both audio and video.
audioUidList
​
1{
2  "subscribeAudioUids": [
3    "string"
4  ],
5  "unsubscribeAudioUids": [
6    "string"
7  ]
8}
The audio subscription list.
Note: This field is only applicable when the streamTypes field is set to audio, or both audio and video.

Properties
​
Name	Type	Required	Description
subscribeAudioUids	Array[string]	false	Specify which UIDs' audio streams to subscribe to. If you want to subscribe to the audio stream of all UIDs, no need to set this field. The array length should not exceed 32, and using an empty array is not recommended. Only one of the fields can be set: this field or unsubscribeAudioUids. For details, see Set up subscription lists.
Note:
This field is only applicable when the streamTypes field is set to audio, or both audio and video.

If you have set up a subscription list for audio or video only, but not at the same time, then the cloud recording service will not subscribe to any video streams. If you set up a subscription list for video, but not for audio, then Agora Cloud Recording will not subscribe to any audio streams.

Set as ["#allstream#"] to subscribe to the audio streams of all UIDs in the channel.

unsubscribeAudioUids	Array[string]	false	Specify which UIDs' audio streams not to subscribe to. The cloud recording service will subscribe to the audio streams of all other UIDs except the specified ones. The array length should not exceed 32, and using an empty array is not recommended. Only one of the fields can be set: this field or subscribeAudioUids. For details, see Set up subscription lists.
videoUidList
​
1{
2  "subscribeVideoUids": [
3    "string"
4  ],
5  "unsubscribeVideoUids": [
6    "string"
7  ]
8}
The video subscription list.
Note: This field only applies when the streamTypes field is set to video, or both audio and video.

Properties
​
Name	Type	Required	Description
subscribeVideoUids	Array[string]	false	Specify which UID's video streams to subscribe to. If you want to subscribe to the video streams of all UIDs, no need to set this field. The array length should not exceed 32, and using an empty array is not recommended. Only one of the fields can be set: this field or unsubscribeVideoUids. For details, see Set up subscription lists.
Note:
This field is only applicable when the streamTypes field is set to video, or both audio and video.

If you have set up a subscription list for audio or video only, but not at the same time, then the cloud recording service will not subscribe to any video streams. If you set up a subscription list for video, but not for audio, then Agora Cloud Recording will not subscribe to any audio streams.

Set as ["#allstream#"] to subscribe to the video streams of all UIDs in the channel.

unsubscribeVideoUids	Array[string]	false	Specify which UIDs' audio streams not to subscribe to. The cloud recording service will subscribe to the video streams of all UIDs except the specified ones. The array length should not exceed 32, and using an empty array is not recommended. Only one of the fields can be set: this field or subscribeVideoUids. For details, see Set up subscription lists.
webRecordingConfig
​
1{
2  "onhold": false
3}
Used to update the web page recording configurations.
Note: Only need to set in web page recording mode.

Properties
​
Name	Type	Required	Description
onhold	Boolean	false	Set whether to pause the web page recording.
- true: Pauses web page recording and generating recording files.
- false: (Default) Continues web page recording and generates recording files.
If you want to resume a paused web page recording, you can call the update method and set onhold to false.
rtmpPublishConfig
​
1{
2  "outputs": [
3    {
4      "rtmpUrl": "string"
5    }
6  ]
7}
Used to update the configurations for pushing web page recording to the CDN.
Note: This should only be set when you push media stream to the CDN during aweb page recording.

Properties
​
Name	Type	Required	Description
outputs	Array[object]	false	See the following.
» rtmpUrl	String	false	The CDN URL where you push the stream to.
Note:
URLs only support the RTMP and RTMPS protocols.

The maximum number of streams being pushed to the CDN is 1.

updateLayout-request
​
1{
2  "cname": "string",
3  "uid": "string",
4  "clientRequest": {
5    "maxResolutionUid": "string",
6    "mixedVideoLayout": 0,
7    "backgroundColor": "#000000",
8    "backgroundImage": "string",
9    "defaultUserBackgroundImage": "string",
10    "layoutConfig": [
11      {
12        "uid": "string",
13        "x_axis": 1,
14        "y_axis": 1,
15        "width": 1,
16        "height": 1,
17        "alpha": 1,
18        "render_mode": 0
19      }
20    ],
21    "backgroundConfig": [
22      {
23        "uid": "string",
24        "image_url": "string",
25        "render_mode": 0
26      }
27    ]
28  }
29}
Properties
​
Name	Type	Required	Description
cname	String	true	The name of the channel where the recording service locates. The cname field you input in the acquire request needs to be the same.
uid	String	true	The string content is the UID used by the recording service in the RTC channel to identify the recording service. It needs to be the same as the uid field you input in the acquire request.
clientRequest	Object	true	clientRequest-updateLayout
clientRequest-updateLayout
​
1{
2  "maxResolutionUid": "string",
3  "mixedVideoLayout": 0,
4  "backgroundColor": "#000000",
5  "backgroundImage": "string",
6  "defaultUserBackgroundImage": "string",
7  "layoutConfig": [
8    {
9      "uid": "string",
10      "x_axis": 1,
11      "y_axis": 1,
12      "width": 1,
13      "height": 1,
14      "alpha": 1,
15      "render_mode": 0
16    }
17  ],
18  "backgroundConfig": [
19    {
20      "uid": "string",
21      "image_url": "string",
22      "render_mode": 0
23    }
24  ]
25}
Properties
​
Name	Type	Required	Description
maxResolutionUid	String	false	Only need to set it in vertical layout. Specify the user ID of the large video window. The string value should be an integer ranging from 1 to (232-1), and cannot be set to 0.
mixedVideoLayout	Number	false	Composite video layout:
- 0: (Default) Floating layout. The first user to join the channel will be displayed as a large window, filling the entire canvas. The video windows of other users will be displayed as small windows, arranged horizontally from bottom to top, up to 4 rows, each with 4 windows. It supports up to a total of 17 windows of different users' videos.
- 1: Adaptive layout. Automatically adjust the size of each user's video window according to the number of users, each user's video window size is consistent, and supports up to 17 windows.
- 2: Vertical layout. The maxResolutionUid is specified to display the large video window on the left side of the screen, and the small video windows of other users are vertically arranged on the right side, with a maximum of two columns, 8 windows per column, supporting up to 17 windows.
- 3: Customized layout. Set the layoutConfig field to customize the mixed layout.
backgroundColor	String	false	The background color of the video canvas. The RGB color table is supported, with strings formatted as a # sign and 6 hexadecimal digits. The default value is "#000000", representing the black color.
backgroundImage	String	false	The URL of the background image of the video canvas. The display mode of the background image is set to cropped mode.
Cropped mode: Will prioritize to ensure that the screen is filled. The background image size is scaled in equal proportion until the entire screen is filled with the background image. If the length and width of the background image differ from the video window, the background image will be peripherally cropped to fill the window.
defaultUserBackgroundImage	String	false	The URL of the default user screen background image.
After configuring this field, when any user stops sending the video streams for more than 3.5 seconds, the screen will switch to the background image; this setting will be overridden if the background image is set separately for a UID.
layoutConfig	Array[object]	false	layoutConfig
backgroundConfig	Array[object]	false	backgroundConfig
query-response
​
1{
2  "resourceId": "string",
3  "sid": "string",
4  "serverResponse": {
5    "status": 0,
6    "extensionServiceState": [
7      {
8        "payload": {
9          "fileList": [
10            {
11              "filename": "string",
12              "sliceStartTime": 0
13            }
14          ],
15          "onhold": true,
16          "state": "string"
17        },
18        "serviceName": "string"
19      }
20    ]
21  },
22  "cname": "string",
23  "uid": "string"
24}
Properties
​
Name	Type	Required	Description
resourceId	String	false	The resource ID used by cloud recording.
sid	String	false	The recording ID.
serverResponse	Object	false	serverResponse
cname	String	false	The name of the channel to be recorded.
uid	String	false	The user ID used by the cloud recording service in the RTC channel to identify the recording service in the channel.
serverResponse
​
1{
2  "status": 0,
3  "extensionServiceState": [
4    {
5      "payload": {
6        "fileList": [
7          {
8            "filename": "string",
9            "sliceStartTime": 0
10          }
11        ],
12        "onhold": true,
13        "state": "string"
14      },
15      "serviceName": "string"
16    }
17  ]
18}
Properties
​
Use-case 1
​
Fields returned in **web page recording **mode.

Name	Type	Required	Description
status	Number	false	Current status of the cloud service:
- 0: Cloud service has not started.
- 1: The cloud service initialization is complete.
- 2: The cloud service components are starting.
- 3: Some cloud service components are ready.
- 4: All cloud service components are ready.
- 5: The cloud service is in progress.
- 6: The cloud service receives the request to stop.
- 7: All components of the cloud service stop.
- 8: The cloud service exits.
- 20: The cloud service exits abnormally.
extensionServiceState	Array[object]	false	extensionServiceState
Use-case 2
​
Fields returned when in individual recording mode and video screenshot capture is turned on.

Name	Type	Required	Description
status	Number	false	Current status of the cloud service:
- 0: Cloud service has not started.
- 1: The cloud service initialization is complete.
- 2: The cloud service components are starting.
- 3: Some cloud service components are ready.
- 4: All cloud service components are ready.
- 5: The cloud service is in progress.
- 6: The cloud service receives the request to stop.
- 7: All components of the cloud service stop.
- 8: The cloud service exits.
- 20: The cloud service exits abnormally.
sliceStartTime	Number	false	Recording start time, the Unix timestamp, in milliseconds.
Use-case 3
​
Fields returned in Use-cases other than video screenshot capturing during the individual recording and web page recording.

Name	Type	Required	Description
status	Number	false	Current status of the cloud service:
- 0: Cloud service has not started.
- 1: The cloud service initialization is complete.
- 2: The cloud service components are starting.
- 3: Some cloud service components are ready.
- 4: All cloud service components are ready.
- 5: The cloud service is in progress.
- 6: The cloud service receives the request to stop.
- 7: All components of the cloud service stop.
- 8: The cloud service exits.
- 20: The cloud service exits abnormally.
fileListMode	String	false	Data format of fileList field:
- "string": fileList is of String type. In composite recording mode, if avFileType is set to ["hls"], fileListMode is "string".
- "json": fileList is a JSON Array. When avFileType is set to ["hls","mp4"] in the individual or composite recording mode, fileListMode is set to "json".
fileList	fileList-string or fileList-json	false	fileList-string or fileList-json
sliceStartTime	Number	false	Recording start time, the Unix timestamp, in milliseconds.
fileList-string
​
Type	Required	Description
String	false	The filename of the M3U8 file generated by the recording.
extensionServiceState
​
1[
2  {
3    "payload": {
4      "fileList": [
5        {
6          "filename": "string",
7          "sliceStartTime": 0
8        }
9      ],
10      "onhold": true,
11      "state": "string"
12    },
13    "serviceName": "string"
14  }
15]
Properties
​
Name	Type	Required	Description
payload	Object	false	payload
serviceName	String	false	Name of the extended service:
- web_recorder_service: Represents the extended service is web page recording.
- rtmp_publish_service: Represents the extended service is to push web page recording to the CDN.
payload
​
Properties
​
Use-case 1
​
The following fields will be returned during web page recording.

Name	Type	Required	Description
fileList	Array[object]	false	See the following.
» filename	String	false	The file names of the M3U8 and MP4 files generated during recording.
» sliceStartTime	Number	false	The recording start time of the file, the Unix timestamp, in seconds.
onhold	Boolean	false	Whether the page recording is in pause state:
- true: In pause state.
- false: The page recording is running.
state	String	false	The status of uploading subscription content to the extension service:
- "init": The service is initializing.
- "inProgress": The service has started and is currently in progress.
- "exit": Service exits.
Use-case 2
​
When pushing the web page recording to CDN, the following fields will be returned.

Name	Type	Required	Description
outputs	Array[object]	false	See the following.
» rtmpUrl	String	false	The CDN address to which you push the stream.
» status	String	false	The current status of stream pushing of the web page recording:
- "connecting": Connecting to the CDN server.
- "publishing": The stream pushing is going on.
- "onhold": Set whether to pause the stream pushing.
- "disconnected": Failed to connect to the CDN server. Agora recommends that you change the CDN address to push the stream.
state	String	false	The status of uploading subscription content to the extension service:
- "init": The service is initializing.
- "inProgress": The service has started and is currently in progress.
- "exit": Service exits.
fileList-json
​
1[
2  {
3    "fileName": "string",
4    "trackType": "string",
5    "uid": "string",
6    "mixedAllUser": true,
7    "isPlayable": true,
8    "sliceStartTime": 0
9  }
10]
The Array[object] type.

Properties
​
Name	Type	Required	Description
fileName	String	false	The file names of the M3U8 and MP4 files generated during recording.
trackType	String	false	The recording file type.
- "audio": Audio-only files.
- "video": Video-only files.
- "audio_and_video": audio and video files
uid	String	false	User UID, indicating which user's audio or video stream is being recorded. In composite recording mode, the uid is "0".
mixedAllUser	Boolean	false	Whether the users were recorded separately.
- true: All users are recorded in a single file.
- false: Each user is recorded separately.
isPlayable	Boolean	false	Whether or not can be played online.
- true: The file can be played online.
- false: The file cannot be played online.
sliceStartTime	Number	false	The recording start time of the file, the Unix timestamp, in seconds.
stop-request
​
1{
2  "cname": "string",
3  "uid": "string",
4  "clientRequest": {
5    "async_stop": false
6  }
7}
Properties
​
Name	Type	Required	Description
cname	String	true	The name of the channel where the recording service locates. The cname field you input in the acquire request needs to be the same.
uid	String	true	The string content is the UID used by the recording service in the RTC channel to identify the recording service. It needs to be the same as the uid field you input in the acquire request.
clientRequest	Object	true	See the following.
» async_stop	Boolean	false	Set the response mechanism for the stop method:
- true: Asynchronous. Immediately receive a response after calling stop.
- false: (Default) Synchronous. After calling stop, you need to wait for all the recorded files to be uploaded to the third-party cloud storage before receiving a response. Agora expects the upload time to be no more than 20 seconds. If the upload exceeds the time limit, you will receive an error code of 50.
stop-response
​
1{
2  "resourceId": "string",
3  "sid": "string",
4  "serverResponse": {
5    "extensionServiceState": [
6      {
7        "playload": {
8          "uploadingStatus": "string"
9        },
10        "serviceName": "string"
11      }
12    ]
13  },
14  "cname": "string",
15  "uid": "string"
16}
Properties
​
Name	Type	Required	Description
resourceId	String	false	The resource ID used by cloud recording.
sid	String	false	The recording ID, identifying a recording cycle.
serverResponse	Object	false	serverResponse
cname	String	false	The name of the channel to be recorded.
uid	String	false	The user ID used by the cloud recording service in the RTC channel to identify the recording service in the channel.
serverResponse-stop
​
1{
2  "extensionServiceState": [
3    {
4      "playload": {
5        "uploadingStatus": "string"
6      },
7      "serviceName": "string"
8    }
9  ]
10}
Properties
​
Use-case 1
​
Fields returned in the web page recording Use-case.

Name	Type	Required	Description
extensionServiceState	Array[object]	false	See the following.
» playload	Object	false	playload-stop
» serviceName	String	false	Service type:
- "upload_service": Upload service.
- "web_recorder_service": Web recording service.
Use-case 2
​
Fields returned in the case of video screenshot capturing during individual recording.

Name	Type	Required	Description
uploadingStatus	String	false	Current upload status of the recording file:
- "uploaded": All recording files have been uploaded to the specified third-party cloud storage.
- "backuped": All files of this recording have been uploaded, but at least one TS file has been uploaded to the Agora Backup Cloud. The Agora server will automatically continue to upload this portion of the file to the designated third-party cloud storage.
- "unknown": Unknown status.
Use-case 3
​
Fields returned in Use-cases other than video screenshot capturing during the individual recording and web page recording.

Name	Type	Required	Description
fileListMode	String	false	Data format of fileList field:
- "string": fileList is of String type. In composite recording mode, if avFileType is set to ["hls"], fileListMode is "string".
- "json": fileList is a JSON Array. When avFileType is set to ["hls","mp4"] in the individual or composite recording mode, fileListMode is set to "json".
fileList	fileList-string or fileList-json	false	fileList-string or fileList-json
uploadingStatus	String	false	Current upload status of the recording file:
- "uploaded": All recording files have been uploaded to the specified third-party cloud storage.
- "backuped": All files of this recording have been uploaded, but at least one TS file has been uploaded to the Agora Backup Cloud. The Agora server will automatically continue to upload this portion of the file to the designated third-party cloud storage.
- "unknown": Unknown status.
playload-stop
​
Properties
​
Use-case 1
​
Fields returned by the upload service in web page recording mode.

Name	Type	Required	Description
uploadingStatus	String	false	Current upload status of the recording file:
- "uploaded": All recording files have been uploaded to the specified third-party cloud storage.
- "backuped": All files of this recording have been uploaded, but at least one TS file has been uploaded to the Agora Backup Cloud. The Agora server will automatically continue to upload this portion of the file to the designated third-party cloud storage.
- "unknown": Unknown status.
Use-case 2
​
Fields returned by the page recording service in web page recording mode.

Name	Type	Required	Description
fileList	Array[object]	false	See the following.
» filename	String	false	The file names of the M3U8 and MP4 files generated during recording.
» sliceStartTime	Number	false	The recording start time of the file, the Unix timestamp, in seconds.
onhold	Boolean	false	Whether the page recording is in pause state:
- true: In pause state.
- false: The page recording is running.
state	String	false	The status of uploading subscription content to the extension service:
- "init": The service is initializing.
- "inProgress": The service has started and is currently in progress.
- "exit": Service exits.