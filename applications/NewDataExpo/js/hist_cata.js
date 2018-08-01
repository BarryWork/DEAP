function hist_cata(data,vname,id,elemt_tag){
    data_format =[];
    var margin = {top: 15, right: 20, bottom: 75, left: 42.5},
    width = jQuery("#scatter").width()/2-5 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;
     if(!elemt_tag){
        elemt_tag = "#scatter";
    }
    else{
         width = jQuery(elemt_tag).width() - margin.left - margin.right;
         height = jQuery(elemt_tag).height() - margin.top - margin.bottom;

    }
    height = height < 130 ? 130 : height;
    width = width < 200 ? 200 : width;
    var y = d3.scale.linear().range([height, 0]);

    data_format =[];
    if(data.type != "categorical"){

        if(Object.keys(data).length > 10) return;
        for( keys in data){
            var tem = {"name": keys, "value": data[keys]};
            data_format.push(tem)
        }
    }else{
        for( keys in data.counts){

            var tem = {"name": data.breaks[keys], "value": data.counts[keys]};
            data_format.push(tem)
        }

    }
    y.domain([0, d3.max(data_format, function(d) { return d.value; })]);
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);


    var svg = d3.select(elemt_tag).append("svg")
        .attr("class","plot-"+id)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("font-size","0.6rem")
        .append("g")
        .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    var barWidth = Math.min(75,width / data_format.length);

    var bar = svg.selectAll("g")
        .data(data_format)
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(" + (10 + i * barWidth) + ",0)"; });    


    bar.append("rect")
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })
      .attr("width", barWidth - 1)
      .attr("fill",elemt_tag == "#scatter" ? "steelblue" : "rgb(72, 133, 237)");

    bar.append("text")
      .attr("x", barWidth / 2)
      .attr("y", function(d) { if(y(d.value) < (height - 10) ) return y(d.value) + 5; 
				else return y(d.value) - 15 })
      .attr("dy", ".75em")
      .attr("fill",function(d) { if(y(d.value) < (height - 10) ) return "white";           
                                else return "Black" })
      .attr("text-anchor","middle")
      .text(function(d) { return d.value; });
    
    bar.append("text")
      .attr("transform","rotate(90)")
      .attr("x", height+3)
      .attr("y", -2/3 * barWidth)
      .attr("dy", ".75em")
      .attr("fill","Black")
      .attr("text-anchor","start")
      .text(function(d) { return d.name; });

   /*
    var tick_width = 15;
    var tick_left = 2;
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.25em")
        .attr("transform", "rotate(-90)" );
    */

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("");


    svg.append("text")
        .attr("x",1/2 *width)
       .attr("y",height+margin.bottom - 0.01 * height)
       .attr("text-anchor","middle")
        .text(vname);
}
