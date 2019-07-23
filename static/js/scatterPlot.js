// Fetch json data
d3.json('/load_data', (d) => {
    return d;
}).then((d) => {
    // Redefine data
    data = d['users'];
    createVisScatter(data);
}).catch((err) => {
    console.error(err);
});

/*
 Function :: createVis()
 */
function createVisScatter(data) {
    document.querySelector('.scatter').innerHTML = '<svg width="400" height="300" id="scatter"></svg>';

    // margin for the plot
    var margin = {top: 20, right: 0, bottom: 50, left: 80},
            svg_width = 450, 
            svg_height = 300,
            plot_width = svg_width - margin.right - margin.left,
            plot_height = svg_height - margin.top - margin.bottom;

    // mark the scale of the plot
    var x = d3.scaleLinear().range([margin.left, plot_width]),
        y = d3.scaleLinear().range([plot_height, margin.top]);

    // select svg and add attributes
    var svg = d3.select("#scatter")
                .append("svg")
                .attr("width", svg_width)
                .attr("height", svg_height);    

    // find min, max of data (extent) and add that as domain of scale x and y
    var d_extent_x = d3.extent(data, data => +data.experience_yr),
        d_extent_y = d3.extent(data, data => +data.hw1_hrs);
    x.domain(d_extent_x);
    y.domain(d_extent_y);

    // add scale to the scale
    var axis_x = d3.axisBottom(x)
                   .ticks(3),
        axis_y = d3.axisLeft(y)
                   .ticks(3);
    
    // draw x axis
    svg.append("g")
       .attr("id", "axis_x")
       .attr("transform", "translate(0," + (plot_height + margin.bottom / 2) + ")")
       .call(axis_x);

    // draw y axis
    svg.append("g")
       .attr("id", "axis_y")
       .attr("transform", "translate(" + 40 + ", 0)")
       .call(axis_y);

    // add text to the x axis
    d3.select("#axis_x")
      .append("text")
      .attr("transform", "translate(250, 40)")
      .text("Programming experience");

    // add text to the y axis
    d3.select("#axis_y")
      .append("text")
      .attr("transform", "rotate(-90) translate(-80, -30)")
      .text("Hours spent on HW1");

    // draw dots as scatter plot
    var circles = svg.append("g")
                     .selectAll("circle")
                     .data(data)
                     .enter()
                     .append("circle")
                     .attr("r", 5)
                     .attr("cx", (data) => x(+data.experience_yr))
                     .attr("cy", (data) => y(+data.hw1_hrs))
                     .attr("class", "non_brushed");


    // handle hightlighted dots
    function highlightBrushedCircles() {

        if (d3.event.selection != null) {

            // revert circles to initial style
            circles.attr("class", "non_brushed");

            var brush_coords = d3.brushSelection(this);

            // style brushed circles
            circles.filter(function (){

                       var cx = d3.select(this).attr("cx"),
                           cy = d3.select(this).attr("cy");

                       return isBrushed(brush_coords, cx, cy);
                   })
                   .attr("class", "brushed");
        }
    }

    // display the table of the data for dots highlighted
    function displayTable() {

        // disregard brushes w/o selections  
        // ref: http://bl.ocks.org/mbostock/6232537
        if (!d3.event.selection) return;

        // programmed clearing of brush after mouse-up
        // ref: https://github.com/d3/d3-brush/issues/10
        d3.select(this).call(brush.move, null);

        var d_brushed =  d3.selectAll(".brushed").data();

        // populate table if one or more elements is brushed
        if (d_brushed.length > 0) {
            clearTableRows();
            d_brushed.forEach(d_row => populateTableRow(d_row))
        } else {
            clearTableRows();
        }
    }

    // selected area
    var brush = d3.brush()
                  .on("brush", highlightBrushedCircles)
                  .on("end", displayTable); 
    svg.append("g")
       .call(brush);

    // clear the table
    function clearTableRows() {
        d3.select("table").style("visibility", "hidden");
        d3.selectAll(".row_data").remove();
    }

    // check if a dot is brushed
    function isBrushed(brush_coords, cx, cy) {

         var x0 = brush_coords[0][0],
             x1 = brush_coords[1][0],
             y0 = brush_coords[0][1],
             y1 = brush_coords[1][1];

        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
    }

    // add data to the table
    function populateTableRow(d_row) {
        d3.select("table").style("visibility", "visible");
        var d_row_filter = [d_row.experience_yr, 
                            d_row.hw1_hrs];

        d3.select("table")
          .append("tr")
          .attr("class", "row_data")
          .selectAll("td")
          .data(d_row_filter)
          .enter()
          .append("td")
          .attr("align", (d, i) => i == 0 ? "left" : "right")
          .text(data => data);
    }
}