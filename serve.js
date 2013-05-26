var fs = require('fs'),
	_ = require('underscore');
var server;
var verb = process.argv.length > 2 ? process.argv[2] : 'site';

if ('pump' === verb) {
	var config = fs.readFileSync('./grab.json');
	var server = require('./grab/app')({
		person: 'aurelienscoubeau',
		profiles: JSON.parse(config),
		store: __dirname + '/jsondata/'
	});
} else if ('robot' === verb) {
	var config = fs.readFileSync('./grab.json');
	var robot = require('./grab/cli')({
		person: 'aurelienscoubeau',
		profiles: _.filter(JSON.parse(config), function (profile, name) {
			return 'aurelienscoubeau' == profile.person && !profile.auth;
		}),
		store: __dirname + '/jsondata/'
	});
	robot.run();
} else {
	var express = require('express');
	server = express();
	server.use(express.logger());
	server.use(express.static('qur2.eu'));
}

if (server) {
	server.listen(3000, '127.0.0.1');
}
