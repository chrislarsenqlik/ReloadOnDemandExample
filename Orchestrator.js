var app = require('express')();
var http = require('http').Server(app);
var noCache = require('connect-nocache')();
var io = require('socket.io')(http);
var ioclient = require('socket.io-client')('http://localhost:44444');
var socketio_port = '44444';
const Promise = require('bluebird');
const enigma = require('enigma.js');
const WebSocket = require('ws');
const schema = require('enigma.js/schemas/12.20.0.json');
var generateFg=1;
var sensordata={};
var windowActive=1;
var eventArray=[];
var objectStepComplCount=16; //When to trigger the reload on the child
var ParentAppReloadCount=objectStepComplCount*4; //when to trigger the reload on the parent
var triggerreload=0;
var overrideTriggerReload=0;
var autoQueue=1;
var invlType='ObjectComplete';
var reloadGroup='';
var reloadId=0;
var groupReloadId=0;
var parentApp='';
var childParentApps=[];
var appData={};
var columnLabels=[];
var columns = [];
var finalAppData;
var column={};
var lastAggReadId_preload=0;
var unique_readid;
var sendData=1;
var messagebroker = 'socket.io'; //kafka'; //or 'socket.io'
var kafka_ip='153.92.35.73';
var kafka_port='2181';
var kafka_topic='iot3';

const session = enigma.create({
  schema,
  url: 'ws://localhost:9076/app/engineData',
  createSocket: url => new WebSocket(url),
});

//Socket.io block start 1
io.on('connection', function(socket){
  console.log('got a connection')
  var appname;

	socket.emit('syncEventArray', eventArray);

  socket.on('generateDataYN', function(data) {
    generateFg=data.generateFg;
    console.log('got a generate start/stop request',generateFg)
    socket.broadcast.emit('generateDataYN', generateFg);
  });

  var triggerFg=0;

  socket.on('triggerReload', function(data) {
    triggerFg=data.triggerFg;
    console.log('got a trigger reload request',triggerFg)


    session
    .open()
    .then(global => global.openDoc('AppControl.qvf')).then((app) => {
      console.log(`Opened app ${app.id}`);
      return app.doReload(0, true, false).then(
        () => app.doSave()
      )
    }).catch(err => console.log('first reload:'+ err))


    // enigma.Connect().then(global => {
    //    return global.getDefaultAppFolder()
    // })
    // //.then(folder => encodeURIComponent('\\') )
    // .then(folder => {
    //   console.log('folder: ',folder)
    //   return enigma.Connect({appname: 'AppControl.qvf'})
    //   .then(global => {
    //       console.log('got into global')
    //       return global.openDoc('AppControl.qvf').then(app => app, err => {
    //           if( err.code === 1002 ) return global.getActiveDoc();
    //       })
    //   })
    //   .then(app => {
    //     console.log('trying first reload');
        
    //     //console.log(app)
    //     return app.doReload(0, true, false).then(
    //         () => app.doSave()
    //     )
        
    //   })
    // })
    // .catch(err => console.log('first reload:'+ err))

    socket.broadcast.emit('cleardata',eventArray)

  });
  
	socket.on('sensoremit', function(data, callback) {
    console.log('got a message, arrayLen:',eventArray.length)
    sensordata=JSON.parse(data);
		socket.broadcast.emit('bounceemit',sensordata);
    eventArray.push(sensordata);
	});
});

//Express Web Endpoints / REST API's
http.listen(socketio_port, function(){
  console.log('listening on *:'+socketio_port);
});

app.get('/lastsensordata', function (req, res) {
  if (autoQueue === 1) {
    var sensordata_string=JSON.stringify(eventArray);
  } else {
    var sensordata_string=JSON.stringify(sensordata);
  }
  res.end(sensordata_string);
  setTimeout(clearArray, 2000);
  function clearArray() {
    eventArray=[];
    console.log('Array Cleared');

  }
  
});
