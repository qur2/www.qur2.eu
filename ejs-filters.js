var timeAgo = function(time_value) {
  var values = time_value.split(" ");
  time_value = values[1] + " " + values[2] + ", " + values[5] + " " + values[3];
  var parsed_date = Date.parse(time_value);
  var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
  var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
  delta = delta + (relative_to.getTimezoneOffset() * 60);

  var r = '';
  if (delta < (24*60*60)) {
    r = 'In the last 24h';
  } else if(delta < (48*60*60)) {
    r = '1 day ago';
  } else {
    r = (parseInt(delta / 86400)).toString() + ' days ago';
  }
  return r;
};

var tweetify = function(t) {
  return t.replace(/((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/gi,
    '<a href="$1">$1</a>')
  .replace(/(^|\s)#(\w+)/g,'$1<a href="http://twitter.com/search?q=%23$2">#$2</a>')
  .replace(/(^|\s)@(\w+)/g,'$1<a href="http://twitter.com/$2">@$2</a>');
};

var months = 'Jan,Feb,Mar,Apr,Mai,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(',');
var monthAndYear = function(dt) {
  var d = new Date(dt);
  return [months[d.getMonth()], d.getFullYear()].join(' ');
};
var dayMonthAndYear = function(dt) {
  var d = new Date(dt);
  return [d.getDate(), months[d.getMonth()], d.getFullYear()].join(' ');
};

exports = module.exports = {
  tweetify: tweetify,
  timeAgo: timeAgo,
  monthAndYear: monthAndYear,
  dayMonthAndYear: dayMonthAndYear
};
