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
	var cliAuth = [undefined, 'oauth2-bearer'];
	var allProfiles = JSON.parse(config);
	var profiles = _.filter(allProfiles, function (profile, name) {
		return 'aurelienscoubeau' == profile.person && cliAuth.indexOf(profile.auth) > -1;
	});
	_.each(profiles, function(profile, name) {
		if (profile.auth) _.extend(profile, allProfiles['sys_'+profile.type].data);
	});
	var robot = require('./grab/cli')({
		person: 'aurelienscoubeau',
		store: __dirname + '/jsondata/',
		profiles: profiles
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
