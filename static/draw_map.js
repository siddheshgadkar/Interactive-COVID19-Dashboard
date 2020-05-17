// The svg
function draw_map(cv_data, map, width, height, us_data, us) {

  var initX;
  var mouseClicked = false;
  var s = 1;
  var rotated = 0;

  var data = d3.map();
  var colorScale = d3
    .scaleThreshold()
    .domain([10, 500, 5000, 10000, 20000, 30000, 50000, 500000])
    .range(d3.schemeBlues[9]);
  mapping_country = {}
  for (i = 0; i < cv_data.length; i++) {
    data.set(cv_data[i]["Country Code"], +cv_data[i]["TotalConfirmed"]);
    mapping_country[cv_data[i]["Country Code"]] = cv_data[i]["Country"]
  }

  //need to store this because on zoom end, using mousewheel, mouse position is NAN
  var mouse;



  const projection = d3
    .geoMercator()
    .center([0, 40])
    .translate([width / 2, height / 2])
    .scale((width - 1) / 2 / Math.PI);
  var path = d3.geoPath().projection(projection);






  const zoom = d3
    .zoom()
    .scaleExtent([-10, 10])
    .on("zoom", zoomed)
    .on("end", zoomended);

  const svg = d3
    .select("#choropleth")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("mousedown", function () {
      if (s !== 1) return;
      initX = d3.mouse(this)[0];
      mouseClicked = true;
    });

  const g = svg.append("g");


  svg.call(zoom);



  function zoomended() {
    if (s !== 1) return;
    rotated = rotated + ((mouse[0] - initX) * 360) / (s * width);
    mouseClicked = false;
  }


  function zoomed() {
    var t = [d3.event.transform.x, d3.event.transform.y];
    s = d3.event.transform.k;
    var h = 0;

    t[0] = Math.min(
      (width / height) * (s - 1),
      Math.max(width * (1 - s), t[0])
    );

    t[1] = Math.min(
      h * (s - 1) + h * s,
      Math.max(height * (1 - s) - h * s, t[1])
    );

    g.selectAll("path") // To prevent stroke width from scaling
      .attr("transform", d3.event.transform);
  }
  var lp = d3.select('#lineplot')
  let mouseOver = function (d, i) {
    d3.selectAll(".Country").transition().duration(200).style("opacity", 0.5);
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    d3.select(this).transition().duration(200).style("opacity", 1);
    x1 = d3.mouse(this)[0];
    y1 = d3.mouse(this)[1];
    tag = d.id
    svg
      .append("text")
      .attr("x", x1 - 5)
      .attr("y", y1 - 5)
      .attr("id", "number_textbox")
      .text(function () {
        return d.total;
      });

    name = d.properties.name
    total = d.total
    var color1
    lp.selectAll('.line').style('opacity', function (r, j) {
      if (r.CountryCode == tag)
        color1 = d3.select(this).style('stroke')

      return r.CountryCode == tag ? 1 : 0;
    });

    current = tag
    bar_color = d3.select('#barchart').selectAll('rect').style('fill')

    d3.select('#barchart').selectAll('rect').style('fill', function (r) {

      return r['Country Code'] == current ? "red" : d3.select(this).style('fill');

    })


    lp.select('.lines').append("text")
      .attr("class", "title-text")
      .style("fill", color1)
      .text(name + " Total cases: " + total)
      .attr("text-anchor", "middle")
      .attr("x", (width - 100) / 2)
      .attr("y", 5);


  };

  let mouseLeave = function (d) {
    d3.select("#number_textbox").remove();
    d3.selectAll(".Country").transition().duration(200).style("opacity", 0.85);
    d3.select(this).transition().duration(200).style("stroke", "transparent");
    // tip.hide();
    lp.selectAll('path').style('opacity', 0.85);
    lp.select(".title-text").remove();

    d3.select('#barchart').selectAll('rect').style('fill', function (r) {

      return bar_color;

    })


  };

  let onClick = function (d) {
    if (d.id == 'USA')
      draw_us(us_data, height, width, us)
  }

  g.append("g")
    .attr("class", "boundary")
    .selectAll("boundary")
    .data(map.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", function (d) {
      d.total = data.get(d.id) || 0;
      return colorScale(d.total);
    })
    .style("stroke", "transparent")
    .attr("class", function (d) {
      return "Country";
    })
    .style("opacity", 0.8)
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave)
    .on("click", onClick);




}
