Setup
​
The API reference for the Signaling SDK documents interface descriptions, methods, basic usage, and return values of the Signaling APIs.

Before you initialize a Signaling client instance, import the Signaling JavaScript SDK into your project:

Using CDN:

1<script src="your_path_to_signaling_sdk/agora-rtm.x.y.z.min.js"></script>
Using a package manager:

1npm install agora-rtm-sdk
Initialization
​
Description
​
Initialization in Signaling refers to creating and initializing a Signaling client instance. When initializing the instance, you need to pass in parameters including appId and userId. You can create a project and get the App ID on the Agora console.

Information
The initialization step needs to be completed before calling the other Signaling APIs.
In order to identifying users and devices, you need to ensure that userId is globally unique and remains constant throughout the lifecycle of the user or device.
Method
​
You can create and initialize an instance as follows:

1class RTM(
2    constructor(
3        appId: string,
4        userId: string,
5        rtmConfig?: {
6             encryptionMode: string,
7             cipherKey: string,
8             salt: Uint8Array,
9             useStringUserId: boolean,
10             presenceTimeout: number,
11             logUpload: boolean,
12             logLevel: string,
13             cloudProxy: boolean
14         }
15    );
16)
Parameter	Type	Required	Default	Description
appId	string	Required	-	The App ID of your Agora project on the Agora console.
userId	string	Required	-	The unique ID to identify a user or device.
rtmConfig	RTMConfig	Optional	-	The configuration parameters for initialization, see RTMConfig.
Basic Usage
​
1const { RTM } = AgoraRTM;
2const rtm = new RTM("yourAppId", "Tony");
Return Value
​
A Signaling client instance. Now you can call other Signaling APIs.

RTMConfig
​
Description
​
RTMConfig is used to configure additional properties when you initializing a Signaling client instance. These configuration properties take effect throughout the lifecycle of the Signaling client and affect the behaviors of the Signaling client.

Method
​
You can create a RTMConfig instance as follows:

1const { RTMConfig } = AgoraRTM;
Property	Type	Required	Default	描述
encryptionMode	string	Optional	-	Encryption mode for end-to-end messages. If you do not set this property or set it as NONE, end-to-end encryption is disabled. For details, see Encryption Mode.
salt	Uint8Array	Optional	-	The salt required for encryption. The value must be a 32-byte binary array.
cipherKey	string	Optional	-	The key used for encryption and decryption. You must set this property if you want to enable message encryption.
presenceTimeout	number	Optional	300	Presence timeout in seconds, and the value range is [5,300]. This parameter refers the delay imposed by the Signaling server before sending a REMOTE_TIMEOUT event notification to other users once it determines that a client has timed out. If the client reconnects and returns to the channel within the specified time, the Signaling server does not send the REMOTE_TIMEOUT event notification to other participants or delete the temporary user data associated with the user.
logUpload	boolean	Optional	false	Whether to upload logs to the server:
true: Enable log upload
false: Disable log upload.
cloudProxy	boolean	Optional	false	Whether to enable the cloud proxy:
true: Enable.
false: Disable.
Note: This feature applies to the Message channels and User channels only.
useStringUserId	boolean	Optional	true	Whether to use string-type user IDs:
true: Use string-type user IDs.
false: Use number-type user IDs. If you set the property as false, SDK automatically converts string-type user IDs to number-type ones. In this case, the userId parameter must be a numeric string (for example, "123456"), otherwise initialization fails.
logLevel	string	Optional	-	Set the output level of SDK log. For details, see log output level.
heartbeatInterval	number	Optional	5	Heartbeat interval in seconds, and the value range is [5,1800]. This parameter refers to the time interval at which the client sends heartbeat packets to the Signaling server. If the client fails to send heartbeat packets to the Signaling server within the specified time, the Signaling server determines that the client has timed out. Please note that this parameter affects the PCU count, which in turn affects billing.
privateConfig	object	Optional	-	When using the private deployment feature of Signaling, you need to configure this parameter.
privateConfig contains the following properties:

Property	Type	Required	Default	Description
serviceType	string[]	Optional	-	Service type. See Service Types.
accessPointHosts	string[]	Optional	-	An addresses list of servers to access the Signaling service. Only supports domain name.
eventUploadHosts	string[]	Optional	-	An addresses list of servers for event uploading. Only supports domain name.
logUploadHosts	string[]	Optional	-	An addresses list of servers for log uploading. Only supports domain name.
originDomains	string[]	Optional	-	A list of domain suffixes used when connecting to the Signaling service. Only supports domain name.
Basic Usage
​
1const { RTM, EncryptionMode } = AgoraRTM;
2const rtmConfig = {
3    encryptionMode : EncryptionMode.AES_256_GCM,
4    salt : yourSalt,
5    cipherKey : "yourCipherKey",
6    presenceTimeout : 300,
7    logUpload : true,
8    logLevel : "debug",
9    cloudProxy : false,
10    useStringUserId : false
11    privateConfig: {
12        serviceType: ["MESSAGE", "STREAM"]
13    },
14    heartbeatInterval: 5
15};
16const rtm = new RTM("yourAppId", "Tony", rtmConfig);
Event Listeners
​
Description
​
Signaling has a total of 8 types of event notifications, as shown in the following table:

Event Type	Description
message	Receive message event notifications in subscribed message channels and subscribed topics.
presence	Receive presence event notifications in subscribed message channels and joined stream channels.
topic	Receive all topic event notifications in joined stream channels.
storage	Receive channel metadata event notifications in subscribed message channels and joined stream channels, and the user metadata event notification of the subscribed users.
lock	Receive lock event notifications in subscribed message channels and joined stream channels.
status	(Deprecated) Receive event notifications when client connection status changes. For details, see SDK connection state and SDK connection state change reason.
linkState	Receive event notifications when client connection status changes. For details, see SDK Link State Types.
tokenPrivilegeWillExpire	Receive event notifications when the client tokens are about to expire.
Add event listeners
​
You can add event listeners as follows:

1 // Add message event listeners
2 // Message
3rtm.addEventListener("message", event => {
4    const channelType = event.channelType; // Which channel type it is, Should be "STREAM", "MESSAGE" or "USER".
5    const channelName = event.channelName; // Which channel does this message come from
6    const topic = event.topicName; // Which Topic does this message come from, it is valid when the channelType is "STREAM".
7    const messageType = event.messageType; // Which message type it is, Should be "STRING" or "BINARY" .
8    const customType = event.customType; // User defined type
9    const publisher = event.publisher; // Message publisher
10    const message = event.message; // Message payload
11    const timestamp = event.timestamp; // Event timestamp
12});
13 // Presence
14rtm.addEventListener("presence", event => {
15    const action = event.eventType; // Which action it is ,should be one of 'SNAPSHOT'、'INTERVAL'、'JOIN'、'LEAVE'、'TIMEOUT、'STATE_CHANGED'、'OUT_OF_SERVICE'.
16    const channelType = event.channelType; // Which channel type it is, Should be "STREAM", "MESSAGE" or "USER".
17    const channelName = event.channelName; // Which channel does this event come from
18    const publisher = event.publisher; // Who trigger this event
19    const states = event.stateChanged; // User state payload, only for stateChanged event
20    const interval = event.interval; // Interval payload, only for interval event
21    const snapshot = event.snapshot; // Snapshot payload, only for snapshot event
22    const timestamp = event.timestamp; // Event timestamp
23});
24 // Topic
25rtm.addEventListener("topic", event => {
26    const action = event.evenType; // Which action it is ,should be one of 'SNAPSHOT'、'JOIN'、'LEAVE'.
27    const channelName = event.channelName; // Which channel does this event come from
28    const publisher = event.userId; // Who trigger this event
29    const topicInfos = event.topicInfos; // Topic information payload
30    const totalTopics = event.totalTopics; // How many topics
31    const timestamp = event.timestamp; // Event timestamp
32});
33 // Storage
34rtm.addEventListener("storage", event => {
35    const channelType = event.channelType; // Which channel type it is, Should be "STREAM", "MESSAGE" or "USER".
36    const channelName = event.channelName; // Which channel does this event come from
37    const publisher = event.publisher; // Who trigger this event
38    const storageType = event.storageType; // Which category the event is, should be 'USER'、'CHANNEL'
39    const action = event.eventType; // Which action it is ,should be one of "SNAPSHOT"、"SET"、"REMOVE"、"UPDATE" or "NONE"
40    const data = event.data; // 'USER_METADATA' or 'CHANNEL_METADATA' payload
41    const timestamp = event.timestamp; // Event timestamp
42});
43 // Lock
44rtm.addEventListener("lock", event => {
45    const channelType = event.channelType; // Which channel type it is, Should be "STREAM", "MESSAGE" or "USER".
46    const channelName = event.channelName; // Which channel does this event come from
47    const publisher = event.publisher; // Who trigger this event
48    const action = event.evenType; // Which action it is ,should be one of 'SET'、'REMOVED'、'ACQUIRED'、'RELEASED'、'EXPIRED'、'SNAPSHOT'
49    const lockName = event.lockName; // Which lock it effect
50    const ttl = event.ttl; // The ttl of this lock
51    const snapshot = event.snapshot; // Snapshot payload
52    const owner = event.owner; // The owner of this lock
53    const timestamp = event.timestamp; // Event timestamp
54});
55 // Connection State Change
56rtm.addEventListener("status", event => {
57    const currentState = event.state; // Which connection state right now
58    const changeReason = event.reason; // Why trigger this event
59    const timestamp = event.timestamp; // Event timestamp
60});
61 // Link State Change
62rtm.addEventListener('linkState', event => {
63    const currentState = event.currentState;
64    const previousState = event.previousState;
65    const serviceType = event.serviceType;
66    const operation = event.operation;
67    const reason = event.reason;
68    const affectedChannels = event.affectedChannels;
69    const unrestoredChannels = event.unrestoredChannels;
70    const timestamp = event.timestamp;
71    const isResumed = event.isResumed;
72 // Token Privilege Will Expire
73rtm.addEventListener("tokenPrivilegeWillExpire", (channelName) => {
74    const channelName = channelName; // Which Channel Token Will Expire
75});
Remove event listeners
​
You can call the removeEventListener method to remove a specified event listener.

1rtm.removeEventListener("status", statusHandler);
login
​
Description
​
After creating and initializing a Signaling client instance, you need to perform the login operation to log in to the Signaling service. With successful login, the client establishes a long link to the Signaling server and allow the client to access Signaling resources.

Method
​
You can call the login method as follows:

1rtm.login(options?: object): Promise<LoginResponse>;
Parameter	Type	Required	Default	Description
options	object	Optional	-	Options for logging into a channel.
The options object includes the following properties:

Property	Type	Required	Default	Description
token	string	Optional	-	The token used for logging to the Signaling system.
If your project enables token authentication, you can provide either the Signaling temporary token or the Signaling token generated by your token server. See User authentication and Deploy Signaling token generator.
If your project does not enable token authentication, you can enter an empty string or the App ID of a project that enables Signaling services.
Basic Usage
​
1try{
2    const result = await rtm.login({ token: "your_token" });
3    console.log(result);
4} catch (status){
5    console.log(status);
6}
Return Value
​
If the method call succeeds, the LoginResponse response as follows is returned:

1type LoginResponse = {
2    timestamp: number // Reserved property, indicating the timestamp of the successful operation
3}
If the method call fails, the ErrorInfo response as follows is returned:

logout
​
Description
​
You can log out of the Signaling system if you don't need to perform any operation.

Method
​
You can call the logout method as follows:

1rtm.logout(): Promise<LogoutResponse>;
Basic Usage
​
1try{
2    const result = await rtm.logout();
3    console.log(result);
4} catch (status){
5    console.log(status);
6}
Return Value
​
If the method call succeeds, the LogoutResponse response as follows is returned:

1type LoginResponse = {
2    timestamp: number // Reserved property, indicating the timestamp of the successful operation
3}
If the method call fails, the ErrorInfo response as follows is returned:

User authentication
​
Authentication is the process of validating the identity of each user before they access a system. Agora uses digital tokens to authenticate users and their privileges.

Signaling provides 3 types of channels: message channels, user channels and stream channels. Different types of channels require different types of tokens:

For message channels and user channels: When logging in to the Signaling system using the login method, you only need to pass the token that enables Signaling service.
For stream channels: In addition to the Signaling token, when joining a stream channel using the join method, you also need to pass the token that enables RTC service.
The token is valid for up to 24 hours. Agora recommends that you update the token before it expires. This article describes how to update the token.

For more information on generating and using tokens, see the following guide:

renewToken
​
Description
​
Call the renewToken method to renew the RTC token.
Different parameter settings applies to different token types:

RTM Token: Only need to fill in the token parameter.
RTC Token: Need to fill in both the token and channelName parameters.
To ensure timely token updates, Agora recommends listening for the tokenPrivilegeWillExpire callback. See Event listeners for details. Once you successfully add the event listener, when the RTC token is about to expire within 30 seconds, the SDK triggers the tokenPrivilegeWillExpire callback to notify the user about the impending token expiration.

Upon receiving this callback, you can generate a new token on the server-side and call the renewToken method to provide the SDK with the newly generated token.

Method
​
You can call the renewToken method as follows:

1rtm.renewToken(token: string, options?: object): Promise<RenewTokenResponse>
Parameters	Type	Required	Default	Description
token	string	Required	-	The newly generated Signaling token.
options	object	Optional	-	Token options.
options contains the following properties:

Property	Type	Required	Default	Description
channelName	string	Optional	-	Channel name. For RTC token, this property is required.
Basic usage
​
Example 1: Renew the Signaling token

1rtmClient.addEventListener('tokenPrivilegeWillExpire', async (channelName) => {
2    if(!channelName){
3        // The RTM Token is about to expire
4        const newToken = "<Your new token>";
5        await rtmClient.renewToken(newToken);
6    }
7});
Example 2: Renew the RTC token

1rtmClient.addEventListener('tokenPrivilegeWillExpire', async (streamChannelName) => {
2    if(streamChannelName){
3        // The RTC Token is about to expire
4        const newToken = "<Your new token>";
5        await rtmClient.renewToken(newToken, {
6            channelName: streamChannelName
7        });
8    }
9});
Return value
​
If the method call succeeds, the RenewTokenResponse response as follows is returned:

1type RenewTokenResponse = {
2    timestamp: number , // Timestamp of the successful operation.
3}
If the method call fails, the ErrorInfo response as follows is returned:

Channels
​
Signaling provides a highly efficient channel management mechanism for data transmission. Any user who subscribes or joins a channel can receive messages and events transmitted within 100 milliseconds. Signaling allows clients to subscribe to hundreds or even thousands of channels. Most Signaling APIs perform actions such as sending, receiving, and encrypting based on channels.

Based on capabilities of Agora, Signaling channels are divided into two types to match different application use-cases:

Message Channel: Follows the industry-standard Pub/Sub (publish/subscribe) mode. You can send and receive messages within the channel by subscribing to a channel, and do not need to create the channel in advance. There is no limit to the number of publishers and subscribers in a channel.

Stream Channel: Follows a concept similar to the observer pattern in the industry, where users need to create and join a channel before sending and receiving messages. You can create different topics in the channel, and messages are organized and managed through topics.

subscribe
​
Description
​
Signaling provides event notification capabilities for messages and states. By listening for callbacks, you can receive messages and events within subscribed channels. For information on how to add and set up event listeners, see Event Listener.

By calling the subscribe method, the client can subscribe to a message channel and start receiving messages and event notifications within the channel. After successfully calling this method, users who subscribe to the channel and enable the presence event listener can receive a presence event with the REMOTE_JOIN type.

Information
This method only applies to the message channel.
Method
​
You can call the subscribe method as follows:

1rtm.subscribe(
2    channelName: string,
3    options?: object
4): Promise<SubscribeResponse>;
Parameter	Type	Required	Default	Description
channelName	string	Yes	-	The channel name.
options	object	Optional	-	Options for subscribing a channel.
The options object includes the following properties:

Property	Type	Required	Default	Description
withMessage	boolean	Optional	true	Whether to subscribe to message event notifications in the channel.
withPresence	boolean	Optional	true	Whether to subscribe to presence event notifications in the channel.
beQuiet	boolean	Optional	false	Whether to set the silent mode. If you set this parameter as true, the SDK has the following behaviors:
You can still receive other users' event notifications.
Event notifications related to your channel activity such as subscribing or unsubscribing the channel, and actions related to setting, getting, or deleting temporary user states, can not be broadcasted to other users.
When calling the getOnlineUsers method, your information can not be found.
When calling the getUserChannels method, channels that you subscribe in silent mode can not be detected.
withMetadata	boolean	Optional	false	Whether to subscribe to storage event notifications in the channel.
withLock	boolean	Optional	false	Whether to subscribe to lock event notifications in the channel.
Basic usage
​
1const options ={
2    withMessage : true,
3    withPresence : true,
4    beQuiet : false,
5    withMetadata : false,
6    withLock : false
7};
8try {
9    const result = await rtm.subscribe("chat_room", options);
10    console.log(result);
11} catch (status) {
12    console.log(status);
13}
Return value
​
If the method call succeeds, the SubscribeResponse response as follows is returned:

1type SubscribeResponse = {
2    timestamp : number // Timestamp of the successful operation.
3    channelName : string // Channel name.
4}
If the method call fails, the ErrorInfo response as follows is returned:

unsubscribe
​
Description
​
If you no longer need to subscribe to a channel, you can call the unsubscribe method to cancel your subscription. After successfully unsubscribing from the channel, other users who subscribe to the channel and enable event listeners can receive a presence event notification with the REMOTE_LEAVE type. For details, see Event Listener.

Information
This method only applies to the message channel.
Method
​
You can call the unsubscribe method as follows:

1rtm.unsubscribe(
2    channelName: string
3): Promise<UnsubscribeResponse>;
Parameter	Type	Required	Default	Description
channelName	string	Yes	-	The channel name.
Basic usage
​
1try {
2    const result = await rtm.unsubscribe("chat_room");
3    console.log(result);
4} catch (status) {
5    console.log(status);
6}
Return value
​
If the method call succeeds, the UnsubscribeResponse response as follows is returned:

1type UnsubscribeResponse = {
2    timestamp : number // Timestamp of the successful operation.
3    channelName : string // Channel name.
4}
If the method call fails, the ErrorInfo response as follows is returned:

createStreamChannel
​
Description
​
Before using a stream channel, you need to call the createStreamChannel method to create an RTMStreamChannel instance. After successfully creating the instance, you can call its relevant methods to implement functions, such as joining the channel, leaving the channel, sending messages in a topic, and subscribing to messages in a topic.

Information
This method only applies to the stream channel.
Method
​
You can call the createStreamChannel method as follows:

1rtm.createStreamChannel(chanelName: string): RTMStreamChannel;
Parameter	Type	Required	Default	Description
channelName	string	Yes	-	The channel name.
Basic usage
​
1try{
2    const Loc_stChannel = await rtm.createStreamChannel( "Location");
3    console.log("Create Stream Channel success!: ");
4} catch (status){
5    console.log(status);
6}
Return value
​
An RTMStreamChannel instance.

join
​
Description
​
After successfully creating a stream channel, you can call the join method to join the stream channel. Once you join the channel, you can implement channel-related functions. At this point, users who subscribe to the channel and add event listeners can receive the following event notifications:

Local users:
presence event notification with the SNAPSHOT type.
topicevent notification with the SNAPSHOT type.
Remote users: presence event notification with the REMOTE_JOIN type.
Information
This method only applies to the stream channel.
Method
​
You can call the join method as follows:

1join(options?: object): Promise<JoinChannelResponse>;
Parameter	Type	Required	Default	Description
options	object	Optional	-	Options for joining a channel.
The options object includes the following properties:

Property	Type	Required	Default	Description
token	string	Optional	-	The token used for joining a stream channel, which is currently the same as the RTC token.
withPresence	boolean	Optional	true	Whether to subscribe to presence event notifications in the channel.
beQuiet	boolean	Optional	false	Whether to set the silent mode. If you set this parameter as true, the SDK has the following behaviors:
You can still receive other users' event notifications.
Event notifications related to your channel activity such as joining or leaving the channel, and actions related to setting, getting, or deleting temporary user states, can not be broadcasted to other users.
When calling the getOnlineUsers method, your information can not be found.
When calling the getUserChannels method, channels that you subscribe in silent mode can not be detected.
withMetadata	boolean	Optional	false	Whether to subscribe to storage event notifications in the channel.
withLock	boolean	Optional	false	Whether to subscribe to lock event notifications in the channel.
Basic usage
​
1const options ={
2    token : "yourToken",
3    withPresence : true,
4    beQuiet : false,
5    withMetadata : false,
6    withLock : false
7};
8try {
9    const result = await stChannel.join(options);
10    console.log(result);
11} catch (status) {
12    console.log(status);
13}
Return value
​
If the method call succeeds, the JoinChannelResponse response as follows is returned:

1type JoinChannelResponse = {
2    timestamp : number , // Timestamp of the successful operation.
3    channelName : string // Channel name.
4}
If the method call fails, the ErrorInfo response as follows is returned:

leave
​
Description
​
If you no longer need to stay in a channel, you can call the leave method to leave the channel. After leaving the channel, you can no longer receive any messages, states, or event notifications from this channel. At the same time, you can no loger be the topic publisher or subscriber of all topics. If you want to restore your previous publisher role and subscribing relationship, you need to call join, joinTopic and subscribeTopic methods in order.

After successfully leaving the channel, remote users in the channel can receive a presence event notification with the REMOTE_LEAVE type. For details, see Event Listener.

Information
This method only applies to the stream channel.
Method
​
You can call the leave method as follows:

1leave(): Promise<LeaveChannelResponse>;
Basic usage
​
1try{
2    const result = await streamChannel.leave();
3    console.log(result);
4} catch (status){
5    console.log(status);
6}
Return value
​
If the method call succeeds, the LeaveChannelResponse response as follows is returned:

1type LeaveChannelResponse = {
2    timestamp : number // Timestamp of the successful operation.
3    channelName : string // Channel name.
4}
If the method call fails, the ErrorInfo response as follows is returned:

Topics
​
Topic is a data stream management mechanism in stream channels. Users can use topics to subscribe to and distribute data streams, as well as notify events in data streams in stream channels.

Information
Topics only exist in stream channels. Therefore, before using relevant features, users need to create an RTMStreamChannel instance.
For more information on the features of topic, click the following card:

joinTopic
​
Description
​
The purpose of joining a topic is to register as one of the message publishers for the topic, so that the user can send messages in the topic. This operation does not affect whether or not the user becomes a subscriber to the topic.

Information
Currently, Signaling supports a single client joining up to 8 topics in the same stream channel at a time.
Before joining a topic, a user need to create an RTMStreamChannel instance and call the join method to join the stream channel.
After successfully joining a topic, users who subscribe to that topic and add event listeners can receive the topic event notification with the REMOTE_JOIN type. For details, see Event Listener.

Method
​
You can call the joinTopic method as follows:

1joinTopic(
2    topicName: string,
3    options?: object
4): Promise<JoinTopicResponse>;
Parameter	Type	Required	Default	Description
topicName	string	Yes	-	The topic name.
options	object	Optional	-	The reserved property.
Basic usage
​
1try {
2    const result = await stChannel.joinTopic( "gesture", options);
3    console.log( result);
4} catch (status) {
5     console.log(status);
6}
Return value
​
If the method call succeeds, the JoinTopicResponse response as follows is returned:

1type JoinTopicResponse = {
2    timestamp: number , // Timestamp of the successful operation.
3    topicName: string // Topic name.
4}
If the method call fails, the ErrorInfo response as follows is returned:

publishTopicMessage
​
Description
​
Call the publishTopicMessage method to send messages to a topic. Users who subscribe to this topic and the message publisher in the channel can receive the message within 100 ms. Before calling the publishTopicMessage method, users need to join the stream channel, and then register as a message publisher for that topic by calling the joinTopic method.

The messages sent by users are encrypted with TLS during transmission, and data link encryption is enabled by default and cannot be disabled. To achieve a higher level of data security, users can also enable client encryption during initialization. For details, see Setup.

Method
​
You can call the publishTopicMessage method as follows:

1publishTopicMessage(
2    topicName: string,
3    message: string | Uint8Array,
4    options?: object
5): Promise<PublishTopicMessageResponse>;
Parameter	Type	Required	Default	Description
topicName	string	Required	-	The topic name.
message	string | Uint8Array	Required	-	The message payload. Supports string or Uint8Array type.
options	object	Optional	-	The message options.
The options object includes the following property:

Property	Type	Required	Default	Description
customType	string	Optional	-	A user-defined field. Only supports string type.
Basic usage
​
Example 1: Send string messages to a specified channel.

1try {
2    const result = await stChannel.publishTopicMessage( "Gesture", JSON.stringify({such: "object"}) );
3    console.log(result);
4} catch (status) {
5    console.log(status);
6}
Example 2: Send Uint8Array messages to a specified channel.

1const str2ab = function(str) {
2    var buf = new ArrayBuffer(str.length * 2); // Each character occupies 2 bytes.
3    var bufView = new Uint16Array(buf);
4    for (var i = 0, strLen = str.length; i < strLen; i++) {
5        bufView[i] = str.charCodeAt(i);
6    }
7    return buf;
8}
9var Message=str2ab("hello world")
10try {
11    const result = await stChannel.publishTopicMessage( "Gesture",Message);
12    console.log(result);
13} catch (status) {
14    console.log(status);
15}
Return value
​
If the method call succeeds, the PublishTopicMessageResponse response as follows is returned:

1type PublishTopicMessageResponse = {
2    timestamp: number , // Timestamp of the successful operation.
3    topicName: string // Topic name.
4}
If the method call fails, the ErrorInfo response as follows is returned:

leaveTopic
​
Description
​
To release resources when you no longer need to publish messages to a topic, you can call the leaveTopic method to unregister as a message publisher for that topic. This method does not affect whether or not you subscribe to that topic or any other operations performed by other users on that topic.

After successfully calling this method, users who subscribe to the channel and enable event listeners can receive the topic event notification with the REMOTE_LEAVE type. For details, see Event Listener.

Method
​
You can call the leaveTopic method as follows:

1leaveTopic(topicName: string): Promise<LeaveTopicResponse>;
Parameter	Type	Required	Default	Description
topicName	string	Required	-	The topic name.
Basic usage
​
1try {
2    const result = await stChannel.leaveTopic("gesture");
3    console.log(result);
4} catch (status) {
5     console.log(status);
6}
Return value
​
If the method call succeeds, the LeaveTopicResponse response as follows is returned:

1type LeaveTopicResponse = {
2    timestamp: number , // Timestamp of the successful operation.
3    topicName: string // Topic name.
4}
If the method call fails, the ErrorInfo response as follows is returned:

subscribeTopic
​
Description
​
After joining a channel, you can call the subscribeTopic method to subscribe to message publishers of topics in the channel.

subscribeTopic is an incremental method. For example, if you call this method for the first time with a subscribing list of [UserA, UserB], and then call it again with a subscribing list of [UserB, UserC], the final successful subscribing result is [UserA, UserB, UserC].

There is no limit to the number of message publishers that can be registered for a single topic in a channel, but a user can only subscribe to a maximum of 50 topics at the same time in the same channel, and a maximum of 64 message publishers in each topic.

Method
​
You can call the subscribeTopic method as follows:

1subscribeTopic(
2    topicName: string,
3    options?: object
4): Promise<SubscribeTopicResponse>;
Parameter	Type	Required	Default	Description
topicName	string	Required	-	The topic name.
options	object	Optional	-	The subscribing options.
The options object includes the following property:

Property	Type	Required	Default	Description
users	string[]	Optional	-	A list of user IDs of message publishers that you want to subscribe to. If you do not set this property, you can randomly subscribe to up to 64 users by default.
Basic usage
​
Example 1: Subscribe to a specified message publisher in a topic.

1var UIDs = ["zhangsan","lisi","wangwu"]
2try {
3    const result = await rtm.subscribeTopic( "Gesture", { users:UIDs } );
4    console.log(result);
5} catch (status) {
6    console.log( status);
7}
Example 2: Randomly subscribe to 64 message publisher in a topic.

1try {
2    const result = await stChannel.subscribeTopic("Gesture");
3    console.log(result);
4}catch(status) {
5    console.log(status);
6}
Return value
​
If the method call succeeds, the SubscribeTopicResponse response as follows is returned:

1type SubscribeTopicResponse = {
2    succeedUsers : string[] , // A list of users who successfully subscribe to the topic.
3    failedUsers : string[], // A list of users who fail to subscribe to the topic.
4    failedDetails : [ // A list of reasons for subscription failure.
5        {
6            user : string , // User ID.
7            errorCode : number , // Error code.
8            reason : string // Reason for the error.
9        },
10    ],
11    timestamp : number, // Timestamp of the successful operation.
12    topiclName : string // Topic name.
13}
If the method call fails, the ErrorInfo response as follows is returned:

unsubscribeTopic
​
Description
​
If you are no longer interested in a topic or no longer need to subscribe to one or more message publishers in the topic, you can call the unsubscribeTopic method to unsubscribe from the topic or unsubscribe from specific message publishers in the topic.

Method
​
You can call the unsubscribeTopic method as follows:

1unsubscribeTopic(
2    topicName: string,
3    options?: object
4): Promise<UnsubscribeTopicResponse>;
Parameter	Type	Required	Default	Description
topicName	string	Required	-	The topic name.
options	object	Optional	-	The unsubscribing options.
The options object includes the following property:

Property	Type	Required	Default	Description
users	string[]	Optional	-	A list of user IDs of message publishers that you want to unsubscribe from. If you do not set this property, you can unsubscribe from the entire topic.
Basic usage
​
Example 1: Unsubscribe from a specified message publisher in a topic.

1try {
2    const result = await rtm.unsubscribeTopic( "Gesture", { users:["Tony","Bo"] });
3    console.log("unsubscribe Topic success: ", result);
4} catch (status) {
5    console.log("unsubscribe Topic failed: ", result);
6}
Example 2: Randomly unsubscribe from 64 message publisher in a topic.

1try {
2    const result = await rtm.unsubscribeTopic("Gesture");
3    console.log("unsubscribe topic success: ", result);
4} catch (status) {
5    console.log("unsubscribe topic failed: ", result);
6}
Return value
​
If the method call succeeds, the UnsubscribeTopicResponse response as follows is returned:

1type UnsubscribeTopicResponse = {
2    timestamp: number , // Timestamp of the successful operation.
3}
If the method call fails, the ErrorInfo response as follows is returned:

Messages
​
Sending and receiving messages is the most basic function of the Signaling service. Any message sent by the Signaling server can be delivered to any online subscribing user within 100 ms. Depending on your business requirements, you can send messages to one user only or broadcast messages to multiple users.

Signaling offers 3 types of channels: message channels, user channels, and stream channels. These channel types have the following differences in how messages are transmitted and methods are called:

Message Channel: The real-time channel. Messages are transmitted through the channel, and the channel is highly scalable. Local users can call the publish method, set the channelType parameter to MESSAGE, and set the channelName parameter to the channel name to send messages in the channel. The remote users can call the subscribe method to subscribe to the channel and receive messages.
User Channel: The real-time channel. Messages are transmitted to the specified user. Local users can call the publish method, set the channelType parameter to USER, and set the channelName parameter to the user ID to send messages to the specified user. The specified remote users receive messages through the message event notifications.
Stream Channel: The streaming transmission channel. Messages are transmitted through the topic. Users need to join a channel first, and then join a topic. Local users can call the publishTopicMessage method to send messages in the topic, and remote users can call the subscribeTopic method to subscribe to the topic and receive messages.
This page introduces how to send and receive messages in a message channel or a user channel.

publish
​
Description
​
You can directly call the publish method to send messages to all online users who subscribe to the channel. Even if you do not subscribe to the channel, you can still send messages in the channel.

Information
The following practices can effectively improve the reliability of message transmission:
The message payload should be within 32 KB; otherwise, the sending will fail.
The upper limit of the rate at which messages are sent to a single channel is 60 QPS. If the sending rate exceeds the limit, some messages will be discarded. A lower rate is better, as long as the requirements are met.
After successfully calling this method, the SDK triggers a message event notification. Users who subscribe to the channel and enabled the event listener can receive this event notification. For details, see Event Listener.

Method
​
You can call the publish method as follows:

1rtm.publish(
2    channelName: string,
3    message: string | Uint8Array,
4    options?: object
5): Promise<PublishResponse>;
Parameter	Type	Required	Default	Description
message	string | Uint8Array	Required	-	The message payload. Supports string or Uint8Array type.
channelName	string	Required	-	Fill in a channel name to send messages in a specified channel, or fill in a user ID to send messages to a specified user.
options	object	Optional	-	The message options.
The options object includes the following property:

Property	Type	Required	Default	Description
customType	string	Optional	-	A user-defined field. Only supports string type.
channelType	string	Optional	-	Channel type. For details, see Channel Types.
Basic usage
​
Example 1: Send string messages to a specified channel.

1try {
2    const result = await rtm.publish( "my_channel", "Hello world" );
3    console.log(result);
4} catch (status) {
5    console.log(status);
6}
Example 2: Send Uint8Array messages to a specified channel.

1const str2ab = function(str) {
2    var buf = new ArrayBuffer(str.length * 2); // Each character occupies 2 bytes.
3    var bufView = new Uint16Array(buf);
4    for (var i = 0, strLen = str.length; i < strLen; i++) {
5        bufView[i] = str.charCodeAt(i);
6    }
7    return buf;
8};
9var Message=str2ab("hello world");
10try {
11    const result = await rtm.publish("my_channel", Message );
12    console.log(result);
13} catch (status) {
14    console.log(status);
15}
Example 3: Send string messages to a specified user.

1try {
2    const result = await rtm.publish("user_b", "Hello world", { channelType: "USER"} );
3    console.log(result);
4} catch (status) {
5    console.log(status);
6}
Example 4: Send Uint8Array messages to a specified user.

1const str2ab = function(str) {
2    var buf = new ArrayBuffer(str.length * 2); // 每个字符占用 2 个字节
3    var bufView = new Uint16Array(buf);
4    for (var i = 0, strLen = str.length; i < strLen; i++) {
5        bufView[i] = str.charCodeAt(i);
6    }
7    return buf;
8};
9var Message=str2ab("hello world");
10try {
11    const result = await rtm.publish("user_b", Message, { channelType: "USER"} );
12    console.log(result);
13} catch (status) {
14    console.log(status);
15}
Information
After successfully calling this method, the SDK triggers a message event notification. Users who subscribe to the channel and enable event listener can receive this event notification. For details, see Event Listener.
Return value
​
If the method call succeeds, the PublishResponse response as follows is returned:

1type PublishResponse = {
2    timestamp: number , // Timestamp of the successful operation.
3    chanelName : string // Channel name.
4}
If the method call fails, the ErrorInfo response as follows is returned:

Receive
​
Signaling provides event notifications for messages, states, and event changes. By listening for callbacks, you can receive messages and events within subscribed channels. As an example, the code snippet below shows how to receive messages from the user channel.

1rtm.addEventListener("message", event => {
2    const channelType = event.channelType; // Which channel type it is, Should be "STREAM", "MESSAGE" or "USER" .
3    const channelName = event.channelName; // Which channel does this message come from
4    const topic = event.topicName; // Which Topic does this message come from, it is valid when the channelType is "STREAM".
5    const messageType = event.messageType; // Which message type it is, Should be "STRING" or "BINARY" .
6    const customType = event.customType; // User defined type
7    const publisher = event.publisher; // Message publisher
8    const message = event.message; // Message payload
9    const timestamp = event.timestamp; // Message timestamp
10});
For information on how to add and set event listeners, see Event Listener.