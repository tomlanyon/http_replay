#!/bin/env node

var matchHost = new RegExp('\w+\.google\.com');
var iface = '';

var pcap     = require('pcap'),
    tracker  = new pcap.TCP_tracker(),
    listener = pcap.createSession(iface, 'port 80');

var startTime;

// parse every packet through the tcp tracker for analysis
listener.on( 'packet', function(raw){
    var p = pcap.decode.packet(raw);
    tracker.track_packet( pcap.decode.packet(raw) );
} );

tracker.on( 'http request', function( session, http ){
    var now = Date.now();

    // if this is the first request we've seen
    if (startTime === undefined){ startTime = now }

    http.request.time = now - startTime;
} );

tracker.on( 'http response', function( session, http ){
    http.response.time = Date.now() - startTime;

    // only record the request if it matches the desired host
    if (matchHost.test(http.request.headers.Host)){
        //console.log( JSON.stringify({ 'request': http.request, 'response': http.response }) );
        console.log( require('util').inspect( [ http.request, http.response ] ) );
    }
} );
