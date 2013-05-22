var exports = module.exports = {};
var url = require('url');
var http = require('http');
var https = require('https');
var passport = require('passport');
var async = require('async');
var _ = require('underscore');
var util = require('util');


function fakePostRequest(req, next) {
	var bound_req = req;
	var bound_next = next;
	return function(err, result) {
		if (err) return bound_next(err);
		util.log(util.format('incoming data for %s', req.profile.type));
		bound_req.body = result;
		bound_next();
	};
}

function ensureJSON(payload) {
	return (typeof payload == 'string') ? JSON.parse(payload) : payload;
}

// Wrap a http(s) request in a function ready to be fired with a callback.
// @see http://nodejs.org/api/url.html
function getPublicResource(resUrl) {
	var client = 'https:' === resUrl.substring(0, 6) ? https : http;
	return function(asyncCallback) {
		var reqOpts = url.parse(resUrl);
		reqOpts.headers = {'user-agent': 'nodejs@qur2.eu'};
		client.request(reqOpts, function(res) {
			var incoming = '';
			res.on('data', function(d) {
				incoming += d;
			});
			res.on('end', function() {
				try {
					var json = ensureJSON(incoming);
					if (400 <= res.statusCode) {
						return asyncCallback(json.message);
					}
					asyncCallback(null, json);
				} catch (e) {
					asyncCallback(e);
				}
			});
			res.on('error', function(e) {
				asyncCallback(e);
			});
		}).on('error', function(e) {
			asyncCallback(e);
		}).end();
	};
}

function getOauthResource(oauth, res_url, token, tokenSecret) {
	return function(asyncCallback) {
		oauth.getProtectedResource(res_url, 'GET', token, tokenSecret,  function (error, data, response) {
			return asyncCallback(null, JSON.parse(data));
		});
	};
}

function middlewareAuth(req, res, next) {
	privateFeed(req, res, next);
}

function middleware(req, res, next) {
	if (req.profile.auth) {
		privateFeed(req, res, next);
	} else {
		publicFeed(req, res, next);
	}
}

function publicFeed(req, res, next) {
	var feed = req.profile.feed;
	var simulatePost = fakePostRequest(req, next);
	var reqs = {};
	_.each(feed, function(url, name) {
		reqs[name] = getPublicResource(url);
	});
	async.parallel(reqs, simulatePost);
	return reqs;
}

function privateFeed(req, res, next) {
	var profile = _.extend({
		callbackURL: req.protocol + '://' + req.headers.host + req.path + '/callback'
	}, req.profile);
	var simulatePost = fakePostRequest(req, next);

	if ('oauth' != profile.auth) next(new Error('Not implemented: '+profile.auth));

	var callback = function(req, token, tokenSecret, incoming, done) {
		var feed = req.profile.feed;
		var oauth = this._oauth;
		var reqs = {};
		_.each(feed, function(feed_url, feed_name) {
			var grabber = getOauthResource(oauth, feed_url, token, tokenSecret);
			reqs[feed_name] = grabber;
		});
		async.parallel(reqs, simulatePost);
	};
	var strategy = getStrategy(profile, callback);
	passport.use(strategy);
	passport.authorize(profile.type, function(err, user) {
		if (!user) { return res.redirect('/login'); }
		res.end('Authenticated!');
	})(req, res, next);
}

function getStrategy(profile, callback) {
	var Strategy = require('passport-' + profile.type).Strategy;
	var options = _.extend({
		passReqToCallback: true,
		customHeaders: { 'Accept-Language': 'en_US' }
	}, profile);
	return new Strategy(options, callback);
}

exports.request = middleware;
exports.access = middlewareAuth;
