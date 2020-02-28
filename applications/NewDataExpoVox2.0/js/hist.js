function hist(data,vname,id,elemt_tag){
    data_format =[];
    data_description = [];
    for(key in data){
        if(key != "breaks" && key != "counts" &&  key != "type" && key!="xmax" && key != "density"  && key != "equidist" && key != "mids" && key != "xname" && key != "xmin")
            data_description.push(key+" : "+data[key].toFixed(4));  
    }

    if(data["type"] != "catagorical"){ 
        /*
        for(i = 0 ; i < data["counts"].length; i++){
            temp = {};
            temp["counts"] = data["counts"][i];
            temp["break-left"] = data["breaks"][i];
        if(i == 1){
        console.log(data["breaks"][i-1])
        }
            if(typeof data["breaks"][i-1] != "undefined"){ 
        temp["break-right"] = data["breaks"][i] + (data["breaks"][i] - data["breaks"][i-1]);
        }
        else {
        temp["break-right"] = data["breaks"][i];
        temp["break-left"] = data["breaks"][i] - (data["breaks"][i+1] - data["breaks"][i]); 
            }
            if(data["counts"][i] != 0) data_format.push(temp)
        }
        */

        for(i = 0; i < data["counts"].length; i++){
            temp = {};
            temp["counts"] = data["counts"][i];
            if(i == data["counts"].length-1){
                temp["break-left"] = data["breaks"][i];
                temp["break-right"] = data["breaks"][i] + (data["breaks"][1] - data["breaks"][0]);

            }else{
                temp["break-left"] = data["breaks"][i];
                temp["break-right"] = data["breaks"][i+1];
            }
            data_format.push(temp);
        }
    }
    else{
        data_format = data; 
    }
    var margin = {top: 5, right: 10, bottom: 20, left: 52.5};

    if(data_description.length > 0){ margin.bottom = margin.bottom + data_description.length * 12  }
    var    width = jQuery("#scatter").width()/2 - 25 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;
    if(!elemt_tag){ 
        elemt_tag = "#scatter";
    }
    else{
        width = jQuery(elemt_tag).width() - margin.left - margin.right;
        height = jQuery(elemt_tag).height() - margin.top - margin.bottom;

    }   
    height = height < 130 ? 130 : height;
    width = width < 275 ? 200 : width > 400 ? 400 : width;

    var x = d3.scale.linear().range([0, width]);
    if(data["type"] != "catagorical")  d3.scale.ordinal().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);


    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(10)

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


    if(data["type"] != "catagorical"){ 
        temp_min = d3.min(data_format,function(d){return Math.min(d["break-left"],d["break-right"]);});
        temp_max =d3.max(data_format, function(d) {return Math.max(d["break-left"],d["break-right"]); });
        temp_range = temp_max - temp_min;
        temp_min = temp_min - temp_range*0.05;
        temp_max = temp_max + temp_range*0.05; 
        x.domain([temp_min,temp_max]);
    }else{ x.domain(data_format["breaks"]);}
    if(data["xmin"] && data["xmax"]){
        x.domain([data["xmin"], data["xmax"]])
    }

    var tick_width = (x(data_format[0]["break-right"]) - x(data_format[0]["break-left"]))*30/32;
    var tick_left = (x(data_format[0]["break-right"]) - x(data_format[0]["break-left"]))*1/32;
    svg.append("g")
        .attr("class", "x axis")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.25em")
        .attr("transform", "rotate(-90)" )

    xaxis_height = svg.select(".x.axis")
        .node().getBBox().height;
    svg.select("*").remove()
    margin.bottom = xaxis_height +margin.bottom ; 
    height = height - xaxis_height;
    //if(elemt_tag != "#scatter"){ 
    //  height = jQuery(elemt_tag).height() - margin.top - margin.bottom;
    //}
    //height = height < 130 ? 130 : height;
    //height = height - xaxis_height; 
    y = d3.scale.linear().range([height, 0]);

    yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

    y.domain([0,d3.max(data_format,function(d) { return d["counts"]; })]);
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height+margin.top)  + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.25em")
        .attr("transform", "rotate(-90)" )
    svg.attr("height", height + margin.bottom + margin.top)

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0, "+margin.top+")")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("");

    svg.selectAll("bar")
        .data(data_format)
        .enter().append("rect")
        .style("fill", elemt_tag == "#scatter" ? "steelblue" : "rgb(72, 133, 237)")
        .attr("x", function(d) { return x(d["break-left"])+ tick_left; })
        .attr("width", tick_width)
        .attr("y", function(d) { return y(d["counts"]); })
        .attr("height", function(d) { return height - y(d["counts"]); })
        .attr("transform", "translate(0," + margin.top+")")
    console.log(margin); 

    var extra = 0;
    if(data_description.length > 0){ extra = data_description.length * 12  }
    svg.append("text")
        .attr("x",1/2 *width)
        .attr("y", 0)
        .attr("transform","translate(0,"+(+height+margin.top+margin.bottom - 10 - extra)+")")
        .attr("text-anchor","middle")
        .text(vname);

    if(data_description.length > 0){
        for(var i = 0 ; i < data_description.length; i++){
            svg.append("text")
                .attr("x",1/2 *width)
                .attr("transform","translate(0,"+(+height+margin.top+margin.bottom - extra - 10+ (i+1) * 12)+")")
                .attr("text-anchor","middle")
                .text(data_description[i]);
        }
    }
}
