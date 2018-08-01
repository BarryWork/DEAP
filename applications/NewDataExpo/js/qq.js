
function qqplot(qq_data,id,ldata,lcolor){

    function predict_line(id,data,color){
        data_f =  parseLineData(data)
            valueline = d3.svg.line()
            .interpolate("basis")
            .x(function(d) { return x(d.x); })
            .y(function(d) { return y(d.y); });

        d3.select(".plot-"+id)
            .append("path")
            .attr("class", "line")
            .attr("stroke",color)
            .attr("stroke-width",2)
            .style("stroke-dasharray", ("3, 3"))
            .attr("fill","none")
            .attr("d", valueline(data_f))
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    }

    function parseLineData(d){
        rt = [];
        for(var i = 0; i < d["x"].length; i++){
            temp = {};
            temp["x"] = d["x"][i];
            temp["y"] = d["y"][i];
            rt.push(temp);
        }
        return rt;
    }

    qq_data_format = []; 

    for(var i = 0; i < qq_data["qq.x"].length; i++){
        temp = {};
        temp["qqx"] = qq_data["qq.x"][i];
        temp["qqy"] = qq_data["qq.y"][i];
        qq_data_format.push(temp);
    }

    var margin = {top: 20, right: 20, bottom: 70, left:42.5},
    width = jQuery("#scatter").width()/2-5 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;
    height = height < 200 ? 200 : height;
    width = width < 200 ? 200 : width;
    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = d3.select("#scatter").append("svg")
        .attr("class", "plot-"+id)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
	.style("font-size","0.6rem")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    qq_data_format.forEach(function(d) {
        d.qqx = +d.qqx;
        d.qqy = +d.qqy;
    });

    x.domain(d3.extent(qq_data_format, function(d) { return d.qqx; })).nice();
    y.domain(d3.extent(qq_data_format, function(d) { return d.qqy; })).nice();
    x.domain( [Math.min(x.domain()[0], ldata.x[0]), Math.max(x.domain()[1], ldata.x[0])])
    y.domain( [Math.min(y.domain()[0], ldata.y[0]), Math.max(y.domain()[1], ldata.y[0])])

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .attr('font-size','12')
        .style("text-anchor", "end")
        .text("theoretical quantiles");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .attr('font-size','12')
        .style("text-anchor", "end")
        .text("sample quantiles")

    svg.selectAll(".dot")
        .data(qq_data_format)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) { return x(d.qqx); })
        .attr("cy", function(d) { return y(d.qqy); })
    /*
    svg.append("text")
        .attr("x", 1/2 * width)
        .attr("y", height+margin.bottom-10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Q-Q Plot")
    */
    predict_line(id,ldata,lcolor)
}
