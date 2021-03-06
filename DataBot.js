var ioclient = require('socket.io-client')('http://localhost:44444');
var uniqueRandomArray=require('random-item');
const Promise = require('bluebird');
const enigma = require('enigma.js');
//var request=require('request');

// Frame rate - 100 ms seems to work fine.. it's nice to stress test with this number. 
// Had to stop consoling in browser at this rate, but otherwise works fine. So far, have added and indexed several thousand records
// at a time and it is not taking over a second total for the reload. Add Load is performant
var intervalGenSecs=.1;

var intervalGenMs=intervalGenSecs*1000; 
var sensorClassArray = new Array('A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P');
var sensorClass=uniqueRandomArray(sensorClassArray);
sensorIdArray=new Array('A123', 'B234', 'C535', 'D254','E559','F023','G737', 'H344', 'I743', 'J554','K534','L024','M232','N020','O255','P723');
var sensorId = uniqueRandomArray(sensorIdArray);
var readValue=Math.floor(Math.random() * 6) + 1;
var readValuePrev1=0;
var timeStamp=Math.floor(Date.now() / 1000);
var timeString=new Date();
var secondsPassed=0;
var eventArray=[];
var positionNum=0;
var triggerreload=0;
var anomalyFg=0;
var generateFg=0;
var objectId=1;
var statusCode='';
var statusCodePrev='';
var failValue=0;
var failValuePrev=0;
var readCounter=0;
var readCounterBtwFail=0;
var failValueTest=0;
var meetsFailCriteria=0;
var conveyorSection=0;
var appToLoad='AppControl.qvf';
var messageBroker='socket.io';

ioclient.on('generateDataYN', function(data) {
    generateFg=data;
    console.log('received generateDataYN, value: ',generateFg)
});

var payloads=[];

if (messageBroker==='kafka') {

	// var producer_options = {
	// 		    // Configuration for when to consider a message as acknowledged, default 1
	// 		    requireAcks: 1,
	// 		    // The amount of time in milliseconds to wait for all acks before considered, default 100ms
	// 		    ackTimeoutMs: 100,
	// 		    // Partitioner type (default = 0, random = 1, cyclic = 2, keyed = 3), default 0
	// 		    partitionerType: 2
	// 		}

	// var kafka = require('kafka-node'),
	// 	HighLevelProducer = kafka.HighLevelProducer,
	// 	client = new kafka.Client('153.92.35.73:2181'),
	// 	producer = new HighLevelProducer(client,producer_options);

	// producer.on('ready', function(){

} //end kafka option

setInterval(function() { console.log("It's been "+intervalGenSecs+" seconds, checking if send reading"); 
	if (generateFg===1) {
		console.log('sending reading')
		readCounter=readCounter+1;
		conveyorSection=1;
		positionNum=positionNum+1;
		if (positionNum <= 4) {
			conveyorSection=1;
		} 
		if (positionNum >=5 && positionNum <= 8 ) {
			conveyorSection=2;
		} else 
		if (positionNum >= 9 && positionNum <= 12 ) {
			conveyorSection=3;
		} 
		if (positionNum >= 13 && positionNum <= 16 ) {
			conveyorSection=4;
		} 
		if (positionNum >= 17) {
			positionNum=1;
			objectId=objectId+1;
			conveyorSection=1;
		} 

		readValue=0;
		sensorIdArray=sensorIdArray;
		sensorId = sensorIdArray[positionNum-1];
		sensorClass=sensorClassArray[positionNum-1];
		readValue=Math.floor(Math.random() * 6) + 1;
		timeStamp=Math.floor(Date.now() / 1000);
		timeString=new Date();

		if (readValue >= 1 && readValue <= 2 ) {
			statusCode='OK'
		} else if (readValue >= 3 && readValue <= 4 ) {
			statusCode='Med'
		} else if (readValue >= 5 && readValue <= 6 ) {
			statusCode='High'
		}

		var data = {
				'sensorid':sensorId,
				'timestamp': timeStamp, 
				'timestring': timeString,
				'readvalue':readValue, 
				'sensorclass':sensorClass, 
				'sensorposition':positionNum, 
				'triggerreload':1, 
				'objectid':objectId, 
				'statuscode':statusCode,
				'read_id':readCounter,
				'failtest':failValueTest,
				'meetsfail':meetsFailCriteria,
				'failvalueprev':failValuePrev,
				'readbtwfail':readCounterBtwFail,
				'conveyorsection':conveyorSection,
				'appToLoad':appToLoad
			}

			var stringJSON = JSON.stringify(data);

			ioclient.emit('sensoremit', stringJSON);


		    // request({
	     //        url: "http://153.92.35.73:8125/upload",
	     //        method: "POST",
	     //        json: true,   // <--Very important!!!
	     //        body: data
	     //    }, function (error, response, body){
	     //        console.log('kafka data send error:' , error);
	     //        //console.log('kafka data send, response:',response);
	     //        console.log('kafka data send body:', body);
	     //    });
		
		
		if (messageBroker==='kafka') {
			payloads = [
	          { topic: 'iot3', messages: stringJSON, partition: 0 }
	        ];

	        //console.log(payloads)
	        
	        producer.send(payloads, function(err, data){
	                console.log(data);
	                console.log('data sent:',data);
	                console.log('err:',err);
	                //console.log('runstamp:',runstamp);
	        });
        }

		readValuePrev1=readValue;
        statusCodePrev=statusCode;

    } else {
		console.log('not generating sensor reading');
	}

}, intervalGenMs);	

//});
