#!/bin/env node

var emitLines = require('./emitLines');
var http      = require('http');

/*
var sendRequest = function(){
        if (http.request.method == 'GET' ||
            http.request.method == 'HEAD'){

            tuples.push( { 'request': http.request, 'response': http.response } );

            var dupRequest = httpLib.request({
                'hostname': destHost,
                'method':   http.request.method,
                'path':     http.request.url,
                'headers':  http.request.headers,
            }, function(res){
                console.log( 'response to the dup request: ' + res.statusCode );

                if ( res.statusCode != http.response.status_code ){
                    console.log( 'ERROR: status code of duplicate doesn\'t match' );
                }

                if ( res.headers['content-length'] != http.response.headers['Content-Length'] ){
                    console.log( 'ERROR: content length of duplicate doesn\'t match' );
                    console.log( 'original(' + http.response.headers['Content-Length']
                            + ') dupe(' + res.headers['content-length'] + ')' );
                }

            });
            dupRequest.setHeader( 'Host', destHost );
            dupRequest.end();

            console.log( http.response );
};
*/

emitLines(process.stdin);
process.stdin.resume();
process.stdin.setEncoding('utf8')
process.stdin.on('line', function(line){
    var request = JSON.parse(line);
    console.log( 'got request', require('util').inspect( request ) );
});
