
// Fetch json data
d3.json('/load_data', (d) => {
    return d;
}).then((d) => {
    data = d['users'];
    createVisDonutChart(data);
}).catch((err) => {
    console.error(err);
});


// function to filter the data as per language
function getProgData(data, prog) {
    new_data = []
    for(var i = 0; i < data.length; i++) {
        if(data[i].prog_lang == prog) {
            new_data.push(data[i]);
        }
    }
    return new_data;
}


// function to create the chart
function createVisDonutChart(data) {

    // Get svg
    const svg = d3.select('#donutChart');

    // Configuration of the chart        
    const width =+ svg.attr('width');
    const height =+ svg.attr('height');
    const radius = Math.min(width, height) / 2.5;
    const thickness = 50

    // transform svg to the center
    var g = svg.append('g')
               .attr('transform', 'translate(' + (width/2) + ', ' + (height/2) + ')');

    // prepare data
    var prog_lang_data = d3.nest()
                           .key(function(d) { return d.prog_lang; })
                           .rollup(function(v) { return v.length; })
                           .entries(data);
    
    // get all languages
    var languages = []
    for(var i = 0; i < prog_lang_data.length; i++) {
      languages.push(prog_lang_data[i]['key'])
    }
    
    // create custom color palette
    var colorPalette = d3.scaleOrdinal()
                         .domain(languages)
                         .range(['#1b7688','#1b7676','#f9d057','#f29e2e','#9b0a0a', '#d7191c'])

    
    // create donut arc
    var arc = d3.arc().innerRadius(radius-thickness).outerRadius(radius);

    // create donut arc on hover with 7.5 more thickness
    var arc_hover = d3.arc().innerRadius(radius-thickness-7.5).outerRadius(radius);

    // create a pie chart for the data
    var pie = d3.pie().value(function(d) { return d.value; }).sort(null);

    // add data to the chart
    var path = g.selectAll('path')
                .data(pie(prog_lang_data))
                .enter()
                .append("g")
                .on("mouseover", function(d) {
                    // update d with more thickness arc
                    let g = d3.select(this)
                    .style("cursor", "pointer")
                    .attr('d', arc_hover)
                    .append("g")
                    .attr("class", "text-group");
                    // add language name to the center of the chart
                    g.append("text")
                    .attr("class", "name-text")
                    .text(`${d.data.key}`)
                    .attr('text-anchor', 'middle')
                    .attr('dy', '-1.2em');
                    // add language count to the center of the chart
                    g.append("text")
                    .attr("class", "value-text")
                    .text(`${d.data.value}`)
                    .attr('text-anchor', 'middle')
                    .attr('dy', '.6em');
                    
                    // update bar and scatter charts with data for the selected language
                    createVisBarChart(getProgData(data, d.data.key));
                    createVisScatter(getProgData(data, d.data.key));
                })
                .on("mouseout", function(d) {
                    d3.select(this)
                    .style("cursor", "none")  
                    .attr('d', arc)
                    .select(".text-group").remove();

                    // reset the bar and scatter chart
                    createVisBarChart(data);
                    createVisScatter(data);                                    
                })                                      
                .append('path')
                .attr('d', arc)
                .attr('fill', (d, i) => colorPalette(i))
                .on("mouseover", function(d) {
                    // update bar and scatter charts with data for the selected language
                    createVisBarChart(getProgData(data, d.data.key));
                    createVisScatter(getProgData(data, d.data.key));                                    
                d3.select(this)     
                    .style("cursor", "pointer")
                    .attr('d', arc_hover)
                })
                .on("mouseout", function(d) {
                    // reset the bar and scatter chart
                    createVisBarChart(data);
                    createVisScatter(data);                                     
                d3.select(this)
                    .style("cursor", "none")  
                    .attr('d', arc)
                })                                    
                .each(function(d, i) {this._current = i;})

}