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
    .replace(/(^|\s)@(\w+)/g,'$1<a href="http://twitter.com/$2">@$2</a>')
    .replace(/\n/g,'<br />');
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

var columns = function(list, n) {
  var columns = [];
  for (var m=0; m<n; m++) {
    columns.push([]);
  }
  for (var i=0, max=list.length; i<max; i++) {
    columns[i%n].push(list[i]);
  }
  return columns;
};

// var faircut = function(schedulee, n, scoreFn) {
//   if (!scoreFn) {
//     scoreFn = function(el) { return 1; };
//   }
//   var total = schedulee.reduce(function (acc, el, i) {
//     return acc + scoreFn(el);
//   }, 0);
//   var avg = Math.round(total / n);
//   var lists = [];
//   for (var m=0; m<n; m++) {
//     var list = [];
//     list.quota = avg;
//     lists.push(list);
//   }
//   var next = 0;
//   schedulee.forEach(function (el, i, j, l, score) {
//     score = scoreFn(el);
//     // starting from the expected list, try to find one with enough space
//     for (l=0; l<n; l++) {
//       j = (l + next) % n;
//       if (lists[j].quota >= score) {
//         lists[j].quota -= score;
//         next = j + 1;
//         return lists[j].push(el);
//       }
//     }
//     // if no list had enough space, insert in the expected one
//     j = next % n;
//     lists[j].push(el);
//     lists[j].quota -= score;
//     next = j + 1;
//   });
//   return lists;
// };


exports = module.exports = {
  tweetify: tweetify,
  timeAgo: timeAgo,
  columns: columns,
  // faircut: faircut,
  monthAndYear: monthAndYear,
  dayMonthAndYear: dayMonthAndYear
};
