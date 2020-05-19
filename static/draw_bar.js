function draw_bar(cv_data, width, height) {
    console.log(cv_data)
    margin = { top: 25, right: 25, bottom: 25, left: 25 }

    data = []
    for (i in cv_data) {
        country_code_confirmed = {}
        country_list = cv_data[i]
        country_code = country_list[0][2]
        country_name = country_list[0][5]
        country_cases = d3.sum(country_list, function (d) { return d[ylabel_index] })
        country_code_confirmed["Country Code"] = country_code
        country_code_confirmed["Country"] = country_name
        country_code_confirmed["TotalConfirmed"] = country_cases
        data.push(country_code_confirmed)
    }


    var y = d3.scaleBand()
        .range([height - 4 * margin.top, 0])
        .padding(0);

    var x = d3.scaleLinear()
        .range([0, width - 2 * margin.left]);

    var svg = d3.select("#barchart").append("svg")
        .attr("width", width)
        .attr("height", height - margin.top)
        .style('overflow-y', 'scroll')
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + 2 * margin.top + ")")
        ;
    i = 0
    reduced = []
    data.forEach(function (d) {
        d.TotalConfirmed = +d.TotalConfirmed


        if (d.TotalConfirmed > 5000) {
            reduced[i] = d
            i += 1
        }

    })


    data = reduced
    data.sort(function (x, y) {
        return d3.descending(x.TotalConfirmed, x.TotalConfirmed)
    })


    x.domain([0, d3.max(data, function (d) { return d.TotalConfirmed; })])
    y.domain(data.map(function (d) { return d.Country; }));
    selected = []


    let clicked = function (d) {
        var map = d3.select("#choropleth").selectAll("path")
        var line = d3.select("#lineplot").selectAll(".line")
        var scatter = d3.select("#scatterplot").selectAll("circle")
        if (!selected.includes(d['Country Code'])) {
            selected.push(d['Country Code'])
            d3.select(this).style('fill', 'red')
            map.style("opacity", function (r) {
                if (selected.includes(r.id))
                    return 1
                else
                    return 0.1
            })

            line.style('opacity', function (r, j) {

                if (selected.includes(r[0][2])) {
                    color1 = d3.select(this).style('stroke')
                    return 1
                }
                return 0

            });

            scatter.style('opacity', function (r) {

                if (selected.includes(r['CountryCode'])) {
                    return 1

                }
                return 0.25

            })
                .attr('r', function (r) {
                    if (selected.includes(r['CountryCode'])) {
                        return 10
                    }
                    return 5
                })

            var par = d3.select("#parallel")
            par.select("div").remove()
            parallel(par_data, $("#parallel").width(), $("#parallel").height(), selected)
        }
        else {

            d3.selectAll('#barchart rect').style('fill', 'rgb(79, 203, 207)')
            map.style('opacity', 0.85)
            console.log(selected)
            selected = []

            line.style("opacity", 1)
            scatter.style("opacity", 0.5)
            scatter.attr("r", 5)

            var par = d3.select("#parallel")
            par.select("div").remove()
            parallel(par_data, $("#parallel").width(), $("#parallel").height(), null)
        }

        if (selected == []) {
            d3.select("#choropleth").selectAll("path")
                .style("opacity", 0.85)
            console.log(selected)


        }



    }



    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("id", (d) => d['Country Code'])
        .attr("width", function (d) { return x(d.TotalConfirmed); })
        .attr("y", function (d) { return y(d.Country); })
        .attr("height", y.bandwidth())
        .on('click', clicked)

        ;

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + (- 20) + ")")
        .call(d3.axisBottom(x).tickFormat(d3.formatPrefix(".1", 1e6)))
        .style('stroke', '#fff');

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y))
        .style('stroke', '#fff')
        .selectAll('.tick')
        .attr("transform", function (d) {
            string = d3.select(this).attr('transform');
            translate = string.substring(string.indexOf("(") + 1, string.indexOf(")")).split(",");
            return 'translate(200,' + translate[1] + ')'
        })
        ;


}