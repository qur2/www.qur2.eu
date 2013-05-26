var grab = require('./lib/grab'),
	util = require('util'),
	fs = require('fs');


var exports = module.exports = function (options) {
	var profiles = options.profiles;
	var store = options.store;

	var post2file = function(req) {
		if (!req.body) {
			throw new Error('No post data!');
		}
		var payload = JSON.stringify(req.body);
		var filepath = store + req.profile.type + '.json';
		util.log(util.format('writing %s chars to %s', payload.length, filepath));
		var r = fs.writeFileSync(filepath, JSON.stringify(req.body));
	};

	var run = function() {
		profiles.forEach(function (profile) {
			var req = {
				profile: profile,
				body: null
			};
			grab.request(req, null, function (err) {
				if (err) throw new Error(err);
				post2file(req);
			});
		});
	};
	return { run: run };
};
