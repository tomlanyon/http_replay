#!/bin/env node

var matchHost = new RegExp('moodle\.vle\.monash\.edu');
var iface = 'eth1';

var pcap     = require('pcap'),
    tracker  = new pcap.TCP_tracker(),
    listener = pcap.createSession(iface, '(host 10.229.5.203 or host 192.160.71.150) and port 80');

var startTime;

// parse every packet through the tcp tracker for analysis
listener.on( 'packet', function(raw){
    var p = pcap.decode.packet(raw);
    tracker.track_packet( pcap.decode.packet(raw) );

    // debuggging to see the raw packet data
    //if (p.link.ip.tcp.data_bytes > 0){
    //    console.log( require('util').inspect( p.link.ip.tcp.data.toString('ascii') ) );
    //}
} );

tracker.on( 'http request', function( session, http ){
    var now = Date.now();

    // if this is the first request we've seen
    if (startTime === undefined){ startTime = now }

    http.request.time = now - startTime;
} );

tracker.on( 'http request body', function( session, http, buf ){
    http.request.body = buf.toString('base64');
} );


tracker.on( 'http response', function( session, http ){
    http.response.time = Date.now() - startTime;

    // these are not the hosts you are looking for *hand wave*
    if (! matchHost.test(http.request.headers.Host)){
        return;
    }

    // skip requests from the LB to the app servers
    // unless they were SSL requests (which we'd not see otherwise)
    if (http.request.headers['Client-IP']){
        if (http.request.headers['WL-Proxy-SSL']){
            http.request.ssl = true;
        } else {
            return;
        }
    }

    //console.log( require('util').inspect( [ http.request, http.response ] ) );
    console.log( JSON.stringify({ 'request': http.request, 'response': http.response }) );

    //console.log( '%d - %s %s %s/%d (RT: %dms) - HTTP %s (%d bytes)',
    //    http.response.time, http.request.method, http.request.url, http.request.ssl == true ? 'HTTPS' : 'HTTP', http.request.http_version,
    //    http.response.time - http.request.time, http.response.status_code, http.response.body_len );
} );
