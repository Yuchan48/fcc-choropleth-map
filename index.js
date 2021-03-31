d3.select("body")
  .append("text")
  .html("<div id = 'title'>United States Educational Attainment</div><div id='description'>Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)</div>");


const w = 860,
      h = 520,
      padding = 50;

const svg = d3.select("body")
              .append("svg")
              .attr("width", w)
              .attr("height", h)
              .attr("viewBox", "0 0 950 600");//



Promise.all([
  d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"), 
  d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json")
])
.then(dataset => {
  const educationData = dataset[0],
        countyData = dataset[1];
  
  const minPercent = d3.min(educationData, d => d.bachelorsOrHigher);
  
  const maxPercent = d3.max(educationData, d => d.bachelorsOrHigher);
  
//Legend  
  const chart = svg.append("g");
  
  const legendScale = d3.scaleLinear()
                        .domain([0, 80])
  .range([w - (1 / 3 * w), w - padding]);
  
  const legendAxis = d3.axisBottom(legendScale)
  .ticks(5);
  
  const legendBottom = chart.attr("transform", "translate(0," + padding + ")")
     .call(legendAxis);
  
  const thresholdPercentage = [0, 10, 20, 30, 40, 50, 60, 70];
  
  const legendWidth = w - (2 / 3 * w) - padding;
  
  const colors = ["#CCE3F5","#1383F4", "#1329F4", "#132096"];
  
  const threshold = d3.scaleQuantile()
                      .domain(thresholdPercentage)
          .range(colors);
  
  const legendBox = svg.append("g")
                       .attr("id", "legend")
  
  legendBox.selectAll("rect")
           .data(thresholdPercentage)
           .enter()
           .append("rect")
           .attr("x", d => legendScale(d))
           .attr("y", padding - 20)
           .attr("width", legendWidth / 8)
           .attr("height", 20)
           .style("fill", d => threshold(d));
  
 //us map 
  
  const colorVar = number => {
    let color = "";
      if (number >= 60){
        color = colors[3];
      } else if (number >= 40 && number < 60){
        color = colors[2];
      }  else if (number >= 20 && number < 40){
        color = colors[1];
      } else {
        color = colors[0];
      }
    return color;
       }
  
  const path = d3.geoPath();
  
  const usMap = svg.append("g")
                   .attr("class", "usMap");//
  
  var tooltip = d3.select("body")
                 .append("div")
                 .attr("opacity", 0)
                 .attr("id", "tooltip");
                   

  usMap.selectAll("path")
             .data(topojson.feature(countyData, countyData.objects.counties).features)
       .enter()
       .append("path")
       .attr("class", "county")
       .attr("d", path)
       .attr("data-fips", d => educationData.filter(s => s.fips == d.id)[0].fips)
       .attr("data-education", d => educationData.filter(s => s.fips == d.id)[0].bachelorsOrHigher)
       .attr("fill", d => colorVar(educationData.filter(s => s.fips == d.id)[0].bachelorsOrHigher))
       .on("mousemove", d => {
	tooltip.attr("data-education", educationData.filter(s => s.fips == d.id)[0].bachelorsOrHigher)
         .style("opacity", 1)
	       .style("left", d3.event.pageX + 20 + "px")
         .style("top", (d3.event.pageY - (padding / 2)) + "px")
         .html(() => {
	const tooltipText = educationData.filter(s => s.fips == d.id)[0];
   
	return ("<div><strong>" + tooltipText.area_name + "</strong>  " + tooltipText.state + ": " + tooltipText.bachelorsOrHigher + "%" + "</div>")
}
	) 
         
})
.on("mouseout", () => {
	tooltip.style("opacity", 0)
});
      
 
  
  
  usMap.append("path")
      .attr("class", "county-borders")
      .attr("d", path(topojson.mesh(countyData, countyData.objects.counties, function(a, b) { return a !== b; })));
                  
        
})