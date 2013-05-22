var server;
var verb = process.argv.length > 2 ? process.argv[2] : 'site';

if ('pump' === verb) {
	var fs = require('fs');
	var config = fs.readFileSync('./grab.json');
	var server = require('./grab/app')({
		person: 'aurelienscoubeau',
		profiles: JSON.parse(config),
		store: __dirname + '/content/'
	});
} else {
	var express = require('express');
	server = express();
	server.use(express.logger());
	server.use(express.static('qur2.eu'));
}

server.listen(3000, '127.0.0.1');
