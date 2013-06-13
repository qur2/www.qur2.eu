var exports = module.exports = {};
var url = require('url');
var http = require('http');
var https = require('https');
var request = require('request');
var passport = require('passport');
var async = require('async');
var _ = require('underscore');
var util = require('util');


var userAgent = 'Junction site generator';

var authSchemes = [
	'oauth',
	'oauth2-bearer'
];

// Make sure the fresh data lies in `request.body`, as if it was freshly posted.
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

// Make sure the data is an actual object, not a string.
function ensureJSON(payload) {
	return (typeof payload == 'string') ? JSON.parse(payload) : payload;
}

// Wrap a http(s) request in a function ready to be fired with a callback.
// @see http://nodejs.org/api/url.html
function getPublicResource(resUrl, headers) {
	if (!headers) headers = {};
	headers['user-agent'] = userAgent;
	return function(callback) {
		request.get({ url: resUrl, headers: headers, json: true }, function (error, response, incoming) {
			if (error) return callback(error);
			return callback(null, incoming);
		});
	};
}

function getOAuthResource(oauth, res_url, token, tokenSecret) {
	return function(asyncCallback) {
		oauth.getProtectedResource(res_url, 'GET', token, tokenSecret,  function (error, data, response) {
			if (error) return asyncCallback(err);
			return asyncCallback(null, JSON.parse(data));
		});
	};
}

function middlewareAuth(req, res, next) {
	oauthFeed(req, res, next);
}

function middleware(req, res, next) {
	if (!req.profile.auth) {
		noAuthFeed(req, res, next);
	} else if (authSchemes.indexOf(req.profile.auth) == -1) {
		next(new Error('Not implemented: ' + req.profile.auth));
	} else if ('oauth' === req.profile.auth) {
		oauthFeed(req, res, next);
	} else if ('oauth2-bearer' === req.profile.auth) {
		oauth2BearerFeed(req, res, next);
	}
}

function noAuthFeed(req, res, next) {
	var feed = req.profile.feed;
	var simulatePost = fakePostRequest(req, next);
	var reqs = {};
	_.each(feed, function(url, name) {
		reqs[name] = getPublicResource(url);
	});
	async.parallel(reqs, simulatePost);
	return reqs;
}

function oauthFeed(req, res, next) {
	var profile = _.extend({
		callbackURL: req.protocol + '://' + req.headers.host + req.path + '/callback'
	}, req.profile);
	var simulatePost = fakePostRequest(req, next);
	var callback = function(req, token, tokenSecret, incoming, done) {
		var feed = req.profile.feed;
		var oauth = this._oauth;
		var reqs = {};
		_.each(feed, function(feed_url, feed_name) {
			var grabber = getOAuthResource(oauth, feed_url, token, tokenSecret);
			reqs[feed_name] = grabber;
		});
		async.parallel(reqs, simulatePost);
	};
	var strategy = getOAuthStrategy(profile, callback);
	passport.use(profile.type, strategy);
	passport.authenticate(profile.type, function(err, user) {
		if (!user) { return res.redirect('/login'); }
		res.end('Authenticated!');
	})(req, res, next);
}

function getOAuthStrategy(profile, callback) {
	var options = _.extend({
		passReqToCallback: true,
		customHeaders: { 'Accept-Language': 'en_US' }
	}, profile);
	var Strategy = require('passport-' + profile.type).Strategy;
	return new Strategy(options, callback);
}

function oauth2BearerFeed(req, res, next) {
	var profile = req.profile;
	var postHead = {};
	request.defaults({jar: false});
	postHead['Connection'] = 'close';
	postHead['User-Agent'] = userAgent;
	postHead['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
	postHead['Authorization'] = 'Basic ' + toBase64(profile.consumerKey + ':' + profile.consumerSecret);
	request.post({
		url: profile.accessTokenUrl,
		headers: postHead,
		form: { 'grant_type': 'client_credentials' }
	}, function (err, resp, body) {
		if (err) return next(err);
		var json = JSON.parse(body);
		if ('bearer' !== json.token_type || !json.access_token) {
			return next(new Error('Wrong token bearer in reponse'));
		}
		var getHead = {};
		getHead['Authorization'] = 'Bearer ' + json.access_token;
		var reqs = {};
		_.each(profile.feed, function(feedUrl, feedName) {
			reqs[feedName] = getPublicResource(feedUrl, getHead);
		});
		var simulatePost = fakePostRequest(req, next);
		async.parallel(reqs, simulatePost);
	});
}

function toBase64(data, encoding) {
	if (!encoding) encoding = 'utf8';
	return new Buffer(data, encoding).toString('base64');
}

exports.request = middleware;
exports.access = middlewareAuth;
exports.authSchemes = authSchemes;
exports.userAgent = userAgent;
