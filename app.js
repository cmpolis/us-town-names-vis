//
//
// Chris Polis, 2016
// Render US states + place names based on regex

//
var render = function(err, statesGeo, cities) {
  if(err) { return console.error('failed to load data'); }

  var lastTimestamp = performance.now();

  // cities = cities.map(function(d) {
  //   return {
  //     lat: +d.lat,
  //     lng: +d.lng,
  //     st: d.state,
  //     n: d.name };
  // });

  // console.log((performance.now() - lastTimestamp) + 'ms for data manipulation');
  // lastTimestamp = performance.now();

  // // test regex query perf
  // var sanOrSantaRE = /(San|Santa) /;
  // var sanOrSanta = cities.filter(function(d) { return sanOrSantaRE.test(d.name); });
  // console.log((performance.now() - lastTimestamp) + 'ms for query');
  // lastTimestamp = performance.now();
  // console.log(sanOrSanta);

  var canvas = document.querySelector('#seasons-vis'),
      c = canvas.getContext("2d");
  canvasDpiScaler(canvas, c);
  var svg = d3.select(document.querySelector('svg'));
  var width = 1000,
      height = 600;

  var projection = d3.geo.albersUsa()
    .scale(width)
    .translate([width / 2, height / 2]);
  var path = d3.geo.path()
    .projection(projection);

  cities.forEach(function(d) {
    d.lat = +d.lat;
    d.lng = +d.lng;
    d.coords = projection([d.lng, d.lat]);
  });

  console.log(cities[0])

  // path(topojson.feature(us, us.objects.counties));
  //     context.stroke();
  console.log(statesGeo.features);
  var states = statesGeo.features;
  svg.selectAll('path.state')
    .data(states).enter()
    .append('path')
    .attr('class', 'state')
    .attr('d', function(d) { return path(d); })

   svg.append('circle')
    .attr('cx', cities[0].coords[0])
    .attr('cy', cities[0].coords[1])
    .attr('r', 3)
    .attr('fill', 'red');
};

d3_queue.queue()
  .defer(d3.json, './us_states.json')
  .defer(d3.csv, './us-cities-lat-lng.csv')
  .await(render);

//.get(function(err, rows) { err ? console.log(err) : render(rows); });
