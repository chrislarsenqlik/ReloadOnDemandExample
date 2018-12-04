var socketio_port = 44444;
var dataqueue=[];
var data=[];
var generateDataYN=0;

require.config({
	paths: {
		socketio: 'http://localhost:'+socketio_port+'/socket.io/socket.io'
	}
});

var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/extensions" ) + 1 );

var config = {
	host: window.location.hostname,
	prefix: prefix,
	port: window.location.port,
	isSecure: window.location.protocol === "https:"
};
//to avoid errors in workbench: you can remove this when you have added an app
var app;
require.config( {
	baseUrl: (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix + "resources"
} );

//Define divs on page
var realtimediv = document.getElementById('QV03');
var statusdiv = document.getElementById('QV01');
var generateBtn = document.getElementById('generateYN');
var reloadBtn = document.getElementById('reloadYN');
var conditionsBtn = document.getElementById('conditionsYN');
var records=[];

var socket = io.connect('http://localhost:44444');

socket.on('connection', function (data) {
	console.log('connected', data);
	socket.emit('connectsuccess', { my: 'good job' });
});

socket.on('bounceemit', function (data) {
	//console.log('got msg bounce', data);
	
	if ( data.length > 1 ) {
		realtimediv.innerHTML += '<br>'+data.sensorclass+' -- '+data.readvalue+' -- '+data.timestring;
		realtimediv.scrollTop = realtimediv.scrollHeight;
		records.push(data);
		statusdiv.innerHTML='number of records: '+records.length;
		statusdiv.innerHTML+='<br>'
		statusdiv.innerHTML+='last record timestamp: '+records.length;
	} else {
		realtimediv.innerHTML += '<br>'+data.sensorclass+' -- '+data.readvalue+' -- '+data.timestring;
		realtimediv.scrollTop = realtimediv.scrollHeight;
		records.push(data);
		statusdiv.innerHTML='number of records: '+records.length;
		statusdiv.innerHTML+='<br>'
		statusdiv.innerHTML+='last record timestamp: '+records[records.length-1].timestring;
		
	}
	
});

socket.on('cleardata', function (data) {
	console.log('got cleardata request', data);
	realtimediv.innerHTML += '<br>'+data.sensorclass+' -- '+data.readvalue+' -- '+data.timestring;
	realtimediv.scrollTop = realtimediv.scrollHeight;
	records=[];
	records.push(data);
	statusdiv.innerHTML='number of records: '+records.length;
	statusdiv.innerHTML+='<br>'
	statusdiv.innerHTML+='last record timestamp: '+records.length;
	
});

if (generateDataYN === 0) {
	console.log('not generating data')
	generateBtn.innerHTML='AWAKEN DATABOT';
	socket.emit('generateDataYN',0)
} else {
	generateDataYN=1;
	socket.emit('generateDataYN',1)
	generateBtn.innerHTML='CLICK TO STOP DATABOT';
}


generateBtn.addEventListener("click", function(){
	socket.emit('generateDataYN',{generateFg: 0})
	if (generateDataYN === 0) {
		generateDataYN = 1
		generateBtn.innerHTML='CLICK TO STOP DATABOT';
		socket.emit('generateDataYN',{generateFg: 1})
	} else {
		generateDataYN = 0
		generateBtn.innerHTML='AWAKEN DATABOT';
		socket.emit('generateDataYN',{generateFg: 0})
	}
});

//conditionsBtn.addEventListener("click", function(){
//	console.log('conditionsMet Button Hit');
//});

reloadBtn.addEventListener("click", function(){
	console.log('Reload Button Hit');
	socket.emit('triggerReload',{triggerFg: 1})
});

console.log('hello console works',$('#reloadYN'))

//realtimediv.innerHTML += '<u>Current Data:</u>';

require( ["js/qlik"], function ( qlik ) {

	var control = false;
	qlik.setOnError( function ( error ) {
		$( '#popupText' ).append( error.message + "<br>" );
		if ( !control ) {
			control = true;
			$( '#popup' ).delay( 1000 ).fadeIn( 1000 ).delay( 11000 ).fadeOut( 1000 );
		}
	} );

	$( "#closePopup" ).click( function () {
		$( '#popup' ).hide();
	} );
	if ( $( 'ul#qbmlist li' ).length === 0 ) {
		$( '#qbmlist' ).append( "<li><a>No bookmarks available</a></li>" );
	}
	$( "body" ).css( "overflow: hidden;" );
	function AppUi ( app ) {
		var me = this;
		this.app = app;
		app.global.isPersonalMode( function ( reply ) {
			me.isPersonalMode = reply.qReturn;
		} );
		app.getAppLayout( function ( layout ) {
			$( "#title" ).html( 'Data Watcher / Trigger' );
			$( "#title" ).attr( "title", "Last reload:" + layout.qLastReloadTime.replace( /T/, ' ' ).replace( /Z/, ' ' ) );
			//TODO: bootstrap tooltip ??
		} );
		app.getList( 'SelectionObject', function ( reply ) {
			$( "[data-qcmd='back']" ).parent().toggleClass( 'disabled', reply.qSelectionObject.qBackCount < 1 );
			$( "[data-qcmd='forward']" ).parent().toggleClass( 'disabled', reply.qSelectionObject.qForwardCount < 1 );
		} );
		app.getList( "BookmarkList", function ( reply ) {
			var str = "";
			reply.qBookmarkList.qItems.forEach( function ( value ) {
				if ( value.qData.title ) {
					str += '<li><a data-id="' + value.qInfo.qId + '">' + value.qData.title + '</a></li>';
				}
			} );
			str += '<li><a data-cmd="create">Create</a></li>';
			$( '#qbmlist' ).html( str ).find( 'a' ).on( 'click', function () {
				var id = $( this ).data( 'id' );
				if ( id ) {
					app.bookmark.apply( id );
				} else {
					var cmd = $( this ).data( 'cmd' );
					if ( cmd === "create" ) {
						$( '#createBmModal' ).modal();
					}
				}
			} );
		} );
		$( "[data-qcmd]" ).on( 'click', function () {
			var $element = $( this );
			switch ( $element.data( 'qcmd' ) ) {
				//app level commands
				case 'clearAll':
					app.clearAll();
					break;
				case 'back':
					app.back();
					break;
				case 'forward':
					app.forward();
					break;
				case 'lockAll':
					app.lockAll();
					break;
				case 'unlockAll':
					app.unlockAll();
					break;
				case 'createBm':
					var title = $( "#bmtitle" ).val(), desc = $( "#bmdesc" ).val();
					app.bookmark.create( title, desc );
					$( '#createBmModal' ).modal( 'hide' );
					break;
			}
		} );
	}

	var app = qlik.openApp('AppControl.qvf', config);
	
	

	//get objects -- inserted here --
	app.getObject('QV04','GbYbDM');
	
	//create cubes and lists -- inserted here --
	if ( app ) {
		new AppUi( app );
	}

} );
