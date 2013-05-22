var fs = require('fs');
var util = require('util');
var path = require('path');
var ejs = require('ejs');
var kerouac = require('kerouac');
var site = kerouac();
var merge = require('kerouac/lib/utils').merge;
var filters = require('./ejs-filters');
merge(ejs.filters, filters);

site.set('base url', 'http://qur2.eu/');
site.set('output', 'qur2.eu');

site.engine('ejs', require('ejs-locals'));

site.content('content');
site.static('public');

site.plug(require('kerouac-sitemap')());
site.plug(require('kerouac-robotstxt')());


// Get the list of publishable profiles
var profiles = [];
fs.readdirSync('content').forEach(function (file) {
  if (file.slice(-5) === '.json') {
   profiles.push(file.slice(0, -5));
  }
});


// Setup a engine to render JSON data:
var jsonEngine = {};
jsonEngine.renderFile = function(str, options, fn) {

};
jsonEngine.render = function(str, options, fn) {
  if ('function' == typeof options) {
    fn = options, options = {};
  }

  try {
    var profileData = JSON.parse(str);
    var tplPath = path.resolve(__dirname, 'layouts', options.layout + '.ejs');
    var tpl = fs.readFileSync(tplPath).toString();
    var content = ejs.render(tpl, { data: profileData });
    fn(null, content);
  } catch (err) {
    fn(err);
  }
};
site.engine('json', jsonEngine);


// Middleware that resets the engine with a new context for profile pages.
site._stack.splice(1, 0, {
  path: '',
  handle: function setProfile(page, next) {
    page.locals.person = 'aurelienscoubeau';
    page.locals.profiles = profiles;
    page.locals.active_profile = false;
    var profile = page.path.slice(1, -5);
    if (profiles.indexOf(profile) > -1) {
      util.log(util.format('generating %s', profile));
      page.locals.active_profile = profile;
      page.locals.layout = 'profiles/' + profile;
      site.engine('json', jsonEngine, page.locals);
    }
    next();
  }
});


site.generate(function(err) {
  if (err) {
    console.error(err.message);
    console.error(err.stack);
    return;
  }
});
