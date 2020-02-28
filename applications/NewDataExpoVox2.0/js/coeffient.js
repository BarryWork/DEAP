function coef(data,id,elemt_tag){
    
    //data = {"mean.per.category":[51.9575017557561,52.4502490314393],"upper.95":[55.4893304913262,55.9899626918743],"lower.95":[48.4256730201861,48.9105353710042],"eff.names":["gender_reference","genderM"]};

    data_format =[];
    for(var i = 0 ; i <  data["eff.names"].length; i++){
	var temp = {};
	for(var key in data){
	    temp[key] = data[key][i];
	}	
	data_format.push(temp);
    }

    
    var margin = {top: 20, right: 20, bottom: 70, left: 200},
    
    width = jQuery("#scatter").width()-5 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;
    width = Math.max(375, width)
    
    var x = d3.scale.linear().range([0, width]);
    var y = d3.scale.ordinal().rangePoints([height, 0]);

    
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
 
    var color = d3.scale.category10();
        color.domain(data["eff.names"]);
    if(!elemt_tag){ elemt_tag = "#scatter";}
    else{
 	 width = jQuery("#scatter").width()/3-5 - margin.left - margin.right;
    }
    var svg = d3.select(elemt_tag).append("svg")
        .attr("class","plot-"+id)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", 
                "translate(" + margin.left + "," + margin.top + ")");

    //row names list is  the range for y axis
    side_bar_length = Math.min(0.5 * (height / data["eff.names"].length), 15); 
    y.domain(data["eff.names"]);

    //x domain is x's min to x's max, and then extends for 1.05 times   
    x.domain([d3.min(data_format,function(d){return d["lower.95"];}), d3.max(data_format, function(d) { return d["upper.95"];})]);

    

    //var tick_width = (x(data_format[0]["break-right"]) - x(data_format[0]["break-left"]))*3/4;
    //var tick_left = (x(data_format[0]["break-right"]) - x(data_format[0]["break-left"]))*1/8;

    // append x axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height+30) + ")")
        .call(xAxis)
        .selectAll("text")
        //.style("text-anchor", "end")
        .style("font-size", "0.6rem")
        .attr("dx", "-.8em")
        .attr("dy", "-.25em")
        .attr("transform", "rotate(-90)" );

    //append y axis
    svg.append("g")
        .attr("class", "y axis")
	.attr("transform","translate(-50,0)")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("font-size", "0.6rem")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("");

    svg.select(".y.axis")
       .selectAll("text")
       .attr("font-size", "0.6rem")
    //append horizontal line, two vertical line and three dots 
    svg.selectAll("coeffient-line")
        .data(data_format)
        .enter().append("line")
	.attr("x1", function(d) { return x(d["lower.95"]); })    
        .attr("y1", function(d) { return y(d["eff.names"]);})
        .attr("x2", function(d) { return x(d["upper.95"]);})
        .attr("y2", function(d) { return y(d["eff.names"]);})
	.attr("stroke", "black")
	.attr("stroke-width", "0.05rem")
        //.text(vname);
    svg.selectAll("coeffient-dot-mean")
        .data(data_format)
        .enter().append("circle")
	.attr("r", "0.2rem")
        .attr("cx", function(d) { return x(d["mean.per.category"]);})
        .attr("cy", function(d) { return  y(d["eff.names"]);})
	.attr("fill", "black")
    
    svg.selectAll("coeffient-line")
        .data(data_format)
        .enter().append("line")
	.attr("x1", function(d) { return x(d["lower.95"]); })    
        .attr("y1", function(d) { return y(d["eff.names"])+side_bar_length;})
        .attr("x2", function(d) { return x(d["lower.95"]);})
        .attr("y2", function(d) { return y(d["eff.names"])-side_bar_length;})
	.attr("stroke", "black")
	.attr("stroke-width", "0.2rem")
    
    svg.selectAll("coeffient-line")
        .data(data_format)
        .enter().append("line")
	.attr("x1", function(d) { return x(d["upper.95"]); })    
        .attr("y1", function(d) { return y(d["eff.names"])+side_bar_length;})
        .attr("x2", function(d) { return x(d["upper.95"]);})
        .attr("y2", function(d) { return y(d["eff.names"])-side_bar_length;})
	.attr("stroke", "black")
	.attr("stroke-width", "0.2rem")
    
}
