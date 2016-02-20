//
//
// Chris Polis, 2016
// Render US states + place names based on regex

//
var render = function(teamSeasons) {
  var canvas = document.querySelector('#seasons-vis');
  var c = canvas.getContext("2d");
  canvasDpiScaler(canvas, c);

  //
  var histogram = {};
  d3.range(-40, 40).forEach(function(ndx) { histogram[ndx] = 0; });
  teamSeasons
    .filter(function(s) { return s.games === 82; })
    .forEach(function(s) { histogram[s.wins - 41]++; });
  histogram = Object.keys(histogram).map(function(k) {
    return { gamesAbove: +k, count: histogram[k] };
  });

  //
  var width = 800,
      height = 600,
      yCenter = height / 2,
      gameWidth = width / 82,
      gameHeight = height / 160,
      gamesAbove, gameNdx, isGSW, isHighWins;

  //
  c.clearRect(0, 0, width, height);

  c.strokeStyle = '#999';
  c.globalAlpha = 0.5;
  // 'perfect season line'
  // c.moveTo(10, yCenter - gameHeight);
  // c.lineWidth = 1.5;
  // c.lineTo(10 + 82 * gameWidth, yCenter - 83 * gameHeight);
  // c.stroke();

  // '.500' line
  c.moveTo(0, yCenter);
  c.lineTo(82 * gameWidth, yCenter);
  c.stroke();
  c.lineWidth = 5.5;

  teamSeasons.forEach(function(season) {
    isGSW = season.year === 2016 &&
            season.team === 'Golden State Warriors';
    isHighWins = season.wins >= 65;
    gamesAbove = 0;
    c.moveTo(0, yCenter);
    c.beginPath();
    for(gameNdx = 0; gameNdx < season.games; gameNdx++) {
      c.lineTo(0 + gameNdx * gameWidth, yCenter - (gameHeight * gamesAbove));
      season.timeline[gameNdx] ? gamesAbove++ : gamesAbove--;
    }
    c.lineTo(0 + gameNdx * gameWidth, yCenter - (gameHeight * gamesAbove));
    c.strokeStyle = isGSW ? '#F05F46' : (isHighWins ? '#E9AF6F' : 'steelblue');
    c.globalAlpha = isGSW ? 0.6 : (isHighWins ? 0.3 : 0.019);
    c.stroke();
  });

  // svg elements
  var svg = d3.select(document.querySelector('#season-vis-svg'));
  var x = d3.scale.linear()
    .domain([0,82]).range([0,width]);
  var histogramX = d3.scale.linear()
    .domain(d3.extent(histogram, function(d) { return d.count; })).range([0,50]);
  var xAxis = d3.svg.axis().scale(x).orient('bottom');
  var y = d3.scale.linear()
    .domain([-40,40]).range([height, 0]);
  var yAxis = d3.svg.axis().scale(y).orient('right');
  svg.selectAll('rect').data(histogram)
    .enter().append('rect')
      .attr('x',width)
      .attr('y', function(d) { return y(d.gamesAbove+0.5); })
      .attr('width', function(d) { return histogramX(d.count); })
      .attr('height', y(1) - y(2))
      // .attr('opacity', function(d) { return d.count * 0.015; })
      // .attr('opacity', function(d) { return 0.2 + d.count * 0.007 })
      .attr('opacity', 0.4)
      .attr('fill', 'steelblue');
  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,'+yCenter+')')
    .call(xAxis);
  svg.append('text')
    .text('Games Played')
    .attr('x', x(80))
    .attr('y', y(0) - 4)
    .attr('text-anchor', 'end');
  svg.append('text')
    .text('Games Above .500')
    .attr('transform', 'translate('+(width-4)+','+(y(0)+30)+') rotate(-90)')
    .attr('text-anchor', 'end');
  svg.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate('+width+',0)')
    .call(yAxis);

};

d3.csv('./us-towns.csv')
  // .row(function(d) {
  //   var games  = +d.games,
  //       wins   = +d.wins,
  //       losses = d.games - d.wins,
  //       ratio  = d.wins / d.games,
  //       bArray = new BitArray(games, d.wlBinary);
  //   return {
  //     year: +d.year,
  //     team: d.team,
  //     games: games,
  //     wins: wins,
  //     losses: losses,
  //     ratio: ratio,
  //     timeline: bArray.toArray().slice(0, games) };
  // }).get(function(err, rows) { err ? console.log(err) : render(rows); });
  .get(function(err, rows) { err ? console.log(err) : render(rows); });
