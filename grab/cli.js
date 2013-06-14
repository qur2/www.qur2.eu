var grab = require('./lib/grab'),
	util = require('util'),
	fs = require('fs');


var exports = module.exports = function (options) {
	var app = require('./app')(options);

	var run = function() {
		options.profiles.forEach(function (profile) {
			var req = {
				profile: profile,
				app: app,
				body: null
			};
			grab.request(req, null, function (err) {
				if (err) throw new Error(err);
				app.filterPostData(req);
				app.post2file(req);
			});
		});
	};
	return { run: run };
};
