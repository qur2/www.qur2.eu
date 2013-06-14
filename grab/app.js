var exports = module.exports = function (options) {
	var express = require('express'),
		_ = require('underscore'),
		passport = require('passport'),
		grab = require('./lib/grab'),
		util = require('util'),
		fs = require('fs');

	var app = express();
	_.extend(app.settings, {
		profiles: [],
		person: '',
		store: __dirname + '/data/'
	}, options);


	/**
	 * App global configuration
	 */

	app.set('views', __dirname + '/views');
	// Setup dev assets
	app.configure('dev', function() {
		console.log('running in dev mode!');
		app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));
		app.use(function (req, res, next) {
			console.log(req.method, req.path);
			next();
		});
	});
	app.use(express.favicon(__dirname + '/assets/favicon.png'));
	app.use(express.static('public'));
	app.use(express.logger());
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.session({ secret: 'keyboard cat, miaou' }));
	// Initialize Passport!  Also use passport.session() middleware, to support
	// persistent login sessions (recommended).
	app.use(passport.initialize());
	app.use(passport.session());


	/**
	 * App routes
	 */

	app.get('/', [setProfiles], function(req, res) {
		res.render('backend.ejs', {
			profiles: req.profiles,
			person: req.app.settings.person
		});
	});

	app.get('/:profile', [setActiveProfile, grab.request], function(req, res) {
		filterPostData(req);
		post2file(req);
		res.send(200);
	});
	app.get('/:profile/callback', [setActiveProfile, grab.access], function(req, res) {
		filterPostData(req);
		post2file(req);
		res.redirect('/');
	});

	function filterPostData(req) {
		if (req.profile.filter) {
			_.each(req.body, function(els, name) {
				var count = req.body[name].length;
				if (!req.profile.filter[name]) return;
				var f = new Function('el', req.profile.filter[name]);
				req.body[name] = req.body[name].filter(f);
				count -= req.body[name].length;
				util.log(util.format('filtered %s items in %s', count, name));
			});
		}
	}

	function post2file(req) {
		if (!req.body) {
			throw new Error('No post data!');
		}
		var payload = JSON.stringify(req.body);
		var filepath = req.app.settings.store + req.profile.type + '.json';
		util.log(util.format('writing %s chars to %s', payload.length, filepath));
		var r = fs.writeFileSync(filepath, JSON.stringify(req.body));
	}

	function setProfiles(req, res, next) {
		var profiles = _.filter(req.app.settings.profiles, function(p) {
			return p.person === req.app.settings.person;
		});
		req.profiles = profiles;
		next();
	}

	function setActiveProfile(req, res, next) {
		var profiles = req.app.settings.profiles;
		var p = req.params.profile;
		req.profile = profiles[p];
		if (req.profile.auth) {
			_.extend(req.profile, profiles['sys_' + p].data);
		}
		next();
	}

	app.post2file = post2file;
	app.filterPostData = filterPostData;

	return app;
};
