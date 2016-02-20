//
//
// Chris Polis, 2016
// Render US states + place names based on regex

var abbreviationMap = {"AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas","CA":"California","CO":"Colorado","CT":"Connecticut","DE":"Delaware","DC":"District of Columbia","FL":"Florida","GA":"Georgia","HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","MP":"Northern Mariana Islands","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming"};

//
var init = function(err, statesGeo, cities) {
  if(err) { return console.error('failed to load data: ', err); }

  var lastTimestamp = performance.now();

  var canvas = document.querySelector('#seasons-vis'),
      c = canvas.getContext("2d");
  canvasDpiScaler(canvas, c);
  var svg = d3.select(document.querySelector('svg')),
      width = 1200,
      height = 600,
      tau = 2 * Math.PI;

  var projection = d3.geo.albersUsa()
    .scale(width * 1)
    .translate([width / 2, height / 2]);
  var path = d3.geo.path()
    .projection(projection);

  cities.forEach(function(d) {
    d.lat = +d.lat;
    d.lng = +d.lng;
    d.coords = projection([d.lng, d.lat]);
  });

  var states = statesGeo.features
    .filter(function(s) { return s.properties.name !== 'Puerto Rico'; });
  svg.selectAll('path.state')
    .data(states).enter()
    .append('path')
    .attr('class', 'state')
    .attr('d', function(d) { return path(d); })
    .attr('fill', 'steelblue')
    .attr('fill-opacity', 0)
    .attr('stroke', '#BBB');
  stateIndexMap = {};

  //
  Object.keys(abbreviationMap).forEach(function(abbr) {
    stateIndexMap[abbr] = states.indexOf(
      states.filter(function(state) { return state.properties.name === abbreviationMap[abbr]; })[0]);
  });
  states.forEach(function(state) { state.cityCount = 0; });
  cities.forEach(function(city) { states[stateIndexMap[city.state]].cityCount++; });

  function runQuery(regexString) {
     c.clearRect(0,0,width,height);

     var regex = new RegExp(regexString);
     states.forEach(function(state) { state.matches = []; });
     cities.forEach(function(city) {
      match = regex.test(city.name);
      c.fillStyle = match ? 'rgba(200, 40, 30, 0.8)' : 'rgba(0, 0, 0, 0.12)';
      c.beginPath();
      c.arc(city.coords[0],city.coords[1], match ? 1.5 : 1,0,tau);
      c.fill();
      match && states[stateIndexMap[city.state]].matches.push(city);
     });

     var opacityScale = d3.scale.linear().range([0, 0.44]);
     opacityScale.domain([0, d3.max(states, function(d) { return (d.matches.length / d.cityCount); })]);
     svg.selectAll('path.state').transition().duration(300)
      .attr('fill-opacity', function(d) { return opacityScale(d.matches.length / d.cityCount); });
  }

  runQuery('(San |Santa |El |Los |Las )');
  window.rq = runQuery;
};

d3_queue.queue()
  .defer(d3.json, './us_states.json')
  .defer(d3.csv, './us-cities-lat-lng.csv')
  .await(init);
