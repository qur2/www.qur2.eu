var fs = require('fs');
var util = require('util');
var path = require('path');
// beware that this one has to be the same as the one
// required by the module ejs-locals
var ejs = require('ejs');
var kerouac = require('kerouac');
var site = kerouac();
var merge = require('kerouac/lib/utils').merge;
var filters = require('./ejs-filters');
merge(ejs.filters, filters);

site.set('base url', 'http://qur2.eu/');
site.set('output', 'qur2.eu');

// Get the list of publishable profiles
var profiles = [];
fs.readdirSync('jsondata').forEach(function (file) {
  if (file.slice(-5) === '.json') {
    profiles.push(file.slice(0, -5));
  }
});
site.locals.person = 'aurelienscoubeau';
site.locals.profiles = profiles;
site.locals.active_profile = false;

site.engine('ejs', require('ejs-locals'));

site.content('content');
site.static('public');
site.content('content');

site.plug(require('kerouac-jsondataview')('jsondata'));
site.plug(require('kerouac-sitemap')());
site.plug(require('kerouac-robotstxt')());


site.generate(function(err) {
  if (err) {
    console.error(err.message);
    console.error(err.stack);
    return;
  }
});
