
function scatter(data, dep, ind, group,id,line_data,line_color_list){
    function color_level(key){
        var c = ['#a6cee3','#fb9a99','#1f78b4','#b2df8a','#33a02c','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928'];
        var key_map = Object.keys(line_data);
        for(var i = 0; i < key_map.length; i++){	
            if( key_map[i] == key) return c[i];
        }
        return "lightgrey"
    }
    function predict_line(id,data,color,groupid){
        data_f =  parseLineData(data)
        valueline = d3.svg.line()
            .interpolate("basis")
            .x(function(d) { return x(d.x); })
            .y(function(d) { return y(d.y); });

        d3.select(".plot-"+id)
            .append("path")
            .attr("class", "line-"+id+" line-id-"+groupid)
            .attr("stroke",color)
            .attr("stroke-width",2)
            .attr("stroke-opacity","0.5")
            .attr("fill","none")
            .attr("d", valueline(data_f))
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")") 
    }
    function predict_conf_interval(id,tld,color,groupid){
        var buttom = parseAreaData(tld[0]);
        var up = parseAreaData(tld[2]);
        var range = Math.min(parseAreaData(tld[0]).map(function(it_s) { return it_s.x; }).length,parseAreaData(tld[2]).map(function(it_s) { return it_s.x; }).length);
        var area = d3.svg.area()
            .interpolate("cardinal")
            .x0( function(d) { return x(buttom[d].x) } )
            .x1( function(d) { return  x(up[d].x) } )
            .y0( function(d) { return y(buttom[d].y) } )
            .y1(  function(d) { return y(up[d].y) } ); 
        d3.select(".plot-"+id)
            .insert("path",":first-child")
            .attr("class", "conf-area area-"+id+ " area-"+groupid)
        //.append("path")
            .datum(d3.range(range))
            .attr('fill', color)
            .attr("fill-opacity", "0.2")
            .attr('d', area)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    }
    function parseAreaData(d){
        rt = [];
        for(var i = 0; i < d["x"].length; i++){
            temp = {};
            if(d["x"][i]< x.domain()[0] || d["x"][i]> x.domain()[1] ||
                d["y"][i]< y.domain()[0] || d["y"][i]> y.domain()[1]){
                if(d["y"][i] > y.domain()[0]  && d["y"][i] < y.domain()[1]){
                    temp["y"] = d["y"][i];
                    if(d["x"][i]< x.domain()[0]){
                        temp["x"] = x.domain()[0];
                    }
                    else if(d["x"][i]<= x.domain()[1]){
                        temp["x"] = d["x"][i];
                    }
                    else{
                        temp["x"] = x.domain()[1];
                    }
                    rt.push(temp);
                    continue;
                }
                if(d["x"][i]> x.domain()[0] && d["x"][i]< x.domain()[1]){
                    temp["x"] = d["x"][i];
                    if(d["y"][i]< y.domain()[0]){
                        temp["y"] = y.domain()[0];
                    }              
                    else if(d["y"][i]<= y.domain()[1]){
                        temp["y"] = d["y"][i];
                    }
                    else{          
                        temp["y"] = y.domain()[1];
                    }              
                    rt.push(temp);
                    continue;
                }
                continue;
            }
            temp["x"] = d["x"][i];
            temp["y"] = d["y"][i];
            rt.push(temp);
        }
        return rt.filter(function(item, index){
            if(index == 0) return item.x !=rt[index+1].x ? true: false;
            if(index == rt.length -1) return  item.x !=rt[index-1].x ? true: false;
            if(item.x !=rt[index+1].x){
                return true;
            }
            else{
                if(item.x != rt[index -1].x){
                    return true;
                }else{
                    return false;
                }
            }

        })
    }    

    function parseLineData(d){
        rt = [];
        for(var i = 0; i < d["x"].length; i++){
            temp = {};
            if(d["x"][i]< x.domain()[0] || d["x"][i]> x.domain()[1] ||
                d["y"][i]< y.domain()[0] || d["y"][i]> y.domain()[1]){
                if(d["y"][i] > y.domain()[0]  && d["y"][i] < y.domain()[1]){
                    temp["y"] = d["y"][i];
                    if(d["x"][i]< x.domain()[0]){
                        temp["x"] = x.domain()[0];
                    }
                    else{
                        temp["x"] = x.domain()[1];
                    }
                    rt.push(temp);
                }
                continue;
            }
            temp["x"] = d["x"][i];
            temp["y"] = d["y"][i];
            rt.push(temp);
        }
        //return rt;

        return rt.filter(function(item, index){
            if (index == 0) return item.x !=rt[index+1].x ? true: false;
            if(index == rt.length -1) return  item.x !=rt[index-1].x ? true: false;
            if(item.x !=rt[index+1].x){
                return true;
            }
            else{
                if(item.x != rt[index -1].x){
                    return true;
                }else{
                    return false;
                }
            }

        })
        //return rt.filter(function(item, index){return  item.x !=rt[index+1].x || index == rt.length -1 ?  true : index == 0? true:item.x !=rt[index-1].x? true:false;});
    }

    function barplot_marginal(id,color,groupid,id_tag){



        data.sort(function(a,b){ return a[ind] > b[ind] ? 1 : -1; }) 
        data_x_min = data[0][ind];
        data_x_max = data[data.length-1][ind];
        data_x = [];
        data_y = [];

        for(it in data){
            if(data[it][group] == id_tag || !group)
                data_x.push(data[it][ind]); 
        }

        data.sort(function(a,b){ return a[dep] > b[dep] ? 1 : -1; }) 
        data_y_min = data[0][dep];
        data_y_max = data[data.length-1][dep];

        for(it in data){
            if(data[it][group] == id_tag || !group)
                data_y.push(data[it][dep]);
        }

        histogram.range([data_x_min,data_x_max])

        svg.selectAll(".bar-x")
            .data(histogram(data_x))
            .enter().insert("rect", ".axis")
        //"line-"+id+" line-id-"+groupid
            .attr("class", "bar-marginal-"+id+" bar-marginal-id-"+groupid)
            .attr("fill",color)
            .attr("fill-opacity", function(d){ return x(d.x) < 0 || x(d.x) > width ? "0" : "0.3" })
            .attr("x", function(d) { return x(d.x) + 1; })
            .attr("y", function(d) { return y_hist(d.y); })
            .attr("width", x(histogram(data_x)[0].dx + histogram(data_x)[0].x) - x(histogram(data_x)[0].x) - 1)
            .attr("height", function(d) { return 20 -  y_hist(d.y);  })
            .attr("transform", "translate(0,-"+(margin.top/3)+")")



        histogram.range([data_y_min,data_y_max])
        svg.selectAll(".bar-y")
            .data(histogram(data_y))
            .enter().insert("rect", ".axis")
            .attr("class", "bar-marginal-"+id+" bar-marginal-id-"+groupid)
            .attr("fill",color)
            .attr("fill-opacity",function(d){ return y(d.x) < 0 || y(d.x) > height ? "0" : "0.3" })
            .attr("x", function(d) { return y(d.x) + 1; })
            .attr("y", function(d) { return y_hist(d.y); })
            .attr("width",  y(histogram(data_y)[0].x)-y(histogram(data_y)[0].dx + histogram(data_y)[0].x)  - 1)
            .attr("height", function(d) { return 20 - y_hist(d.y); })
            .attr("transform", "rotate(90)translate(-"+(y(histogram(data_y)[0].x)-y(histogram(data_y)[0].dx + histogram(data_y)[0].x)  - 1)+",-"+(width+margin.left/2)+")")

    }

    var margin = {
        top: 100,
        right: 120,
        bottom: 50,
        left: 57.5
    }
    logistic = false;
    if(data[0][dep+"_level"]){
        group = dep+"_level"; 
        logistic = true; 
    } 

    if(jQuery(window).width() < 400){
        margin = {
            top: 20,
            right: 20,
            bottom: 150,
            left: 57.5
        };
        if(!gp) margin.bottom = margin.bottom - 100; 
    }
    var outerWidth = jQuery("#scatter").width(),
        outerHeight = Math.max(outerWidth * 4/5,400);
    width = outerWidth - margin.left - margin.right,
        height = outerHeight - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0, width]).nice();

    var y = d3.scale.linear()
        .range([height, 0]).nice();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(-height);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickSize(-width);

    var y_hist = d3.scale.linear()
        .domain([0, 100])
        .range([20, 0]);

    var x_hist = d3.scale.linear()
        .domain([0, 100])
        .range([25, 0])

    var histogram = d3.layout.histogram()
        .frequency(true)
        .bins(70)
    var xCat = ind,
        yCat = dep,
        //rCat = "",
        colorCat = group;
    c_domain = {};
    var c_domain_arr = []
    for(index in data){
        c_domain[data[index][colorCat]] = data[index][colorCat];
    }
    for(key in c_domain){
        if(key && key.length < 100)
            c_domain_arr.push(key);
    }
    c_domain_arr.sort()
    c_domain_arr = c_domain_arr.filter(function(d){return d!="undefined"});
    /*
       var labels = {
       "los_icu": "Length of stay in ICU",
       "Prob_Mortality": "Probability",
       "age": "Age"
       }
       */

    var xMax = d3.max(data, function(d) {
        return d[xCat];
    }) * 1.01,
        xMin = d3.min(data, function(d) {
            return d[xCat];
        })* 0.99,
        yMax = d3.max(data, function(d) {
            return d[yCat];
        }) * 1.01,
        yMin = d3.min(data, function(d) {
            return d[yCat];
        })* 0.99;
    x.domain([xMin, xMax]);
    y.domain([yMin, yMax]);

    var color = function colores_google(n) {
        var colores_g = ["#dc3912", "#3366cc", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
        if(n<0) return "#4682B4";
        return colores_g[n % colores_g.length];
    }

    //d3.scale.category20();
    //color = d3.scale.linear().domain([1,20])
    //       .interpolate(d3.interpolateHcl)
    //       .range([d3.rgb("#007AFF"), d3.rgb('#FFF500')]);
    var tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            //Hard coding: TODO fix. Requaire R output always contains these demographical variables. 
            if(d["abcd_site"])
                return "ID : "+d["src_subject_id"]+
                    "<br>Site : "+d["abcd_site"]+
                    "<br>Sex : "+d["sex"] + 
                    "<br>Race : "+d["race.ethnicity"]+
                    "<br>Age : "+d["interview_age"]+
                    "<br>Household Highest Education : "+d["high.educ"]+
                    "<br>Household Income : "+d["household.income"]+
                    "<br>"+dep+" : "+d[dep] +
                    "<br>"+ind+" : "+d[ind];

            if(d["res"])
                return "ID : "+d["src_subject_id"]+
                    "<br>Site : "+d["abcd_site"]+
                    "<br>Sex : "+d["sex"] +      
                    "<br>Race : "+d["race.ethnicity"]+
                    "<br>Age : "+d["interview_age"]+
                    "<br>Household Highest Education : "+d["high.educ"]+
                    "<br>Household Income : "+d["household.income"]+
                    "<br>res : " +d["res"]+
                    "<br>fitted : "+d["fitted"]; 
        });

    var zoomBeh = d3.behavior.zoom()
        .x(x)
        .y(y)
        .scaleExtent([0.9, 8])
        .on("zoom", zoom);

    var svg = d3.select("#scatter")
        .append("svg")
        .attr("class","plot-"+id)
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .style("font-size","0.6rem")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoomBeh);
    svg.call(tip);
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill","transparent")
    svg.append("g")
        .classed("x axis", true)
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .classed("label", true)
        .attr("x", width)
        .attr("y", Math.min(margin.bottom - 10,40))
        .style("text-anchor", "end")
        .text("x = "+ind);
    svg.append("g")
        .classed("y axis", true)
        .call(yAxis)
        .append("text")
        .classed("label", true)
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("dy", "1.5em")
        .style("text-anchor", "end")
        .text("y = "+dep);

    var objects = svg.append("svg")
        .classed("objects", true)
        .attr("width", width)
        .attr("height", height);
    objects.append("svg:line")
        .classed("axisLine hAxisLine", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width)
        .attr("y2", 0)
        .attr("transform", "translate(0," + height + ")");
    objects.append("svg:line")
        .classed("axisLine vAxisLine", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", height);
    for(item  in line_data){
        console.log("item is ..."+item)
        if(item == "shuffle") continue;
        tld = line_data[item];
        if(tld.length == 3){
            predict_conf_interval(id,tld,color(c_domain_arr.indexOf(""+item)),item.split(/[^a-zA-Z0-9]/).join(""))
            barplot_marginal(id,color(c_domain_arr.indexOf(""+item)),item.split(/[^a-zA-Z0-9]/).join(""),item) 
        }
        else{
            barplot_marginal(id,"steelblue",item.split(/[^a-zA-Z0-9]/).join(""),item)
        }
        for(item_s in tld){
            var line_col = color(c_domain_arr.indexOf(""+item));
            if(item_s == "shuffle") continue;
            //if(item_s == 1)  line_col = "black";
            if(item_s+1 == tld.length)  line_col = "black";
            predict_line(id,tld[item_s],line_col,item.split(/[^a-zA-Z0-9]/).join(""))
        }

    }

    for( it in c_domain_arr){
        item = c_domain_arr[it];
        barplot_marginal(id,color(c_domain_arr.indexOf(""+item)),item.split(/[^a-zA-Z0-9]/).join(""),item)
    }

    objects.selectAll(".scatter-dot-"+id)
        .data(data)
        .enter().append("circle")
        .classed("scatter-dot-"+id, true)
        .attr({
            r: function(d) {
                return "0.28em";
                //return 4 * Math.sqrt(d[rCat] / Math.PI);
            },
            cx: function(d) {
                return x(d[xCat]);
            },
            cy: function(d) {
                return y(d[yCat]);
            }
        })
        .style("fill", function(d) {
            return color((c_domain_arr.indexOf(""+d[colorCat])));
        })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);


    /*
    svg
        .append("path")
        .attr("stroke","black")
        .attr("stroke-width",2)
        .attr("stroke-opacity","0.5")
        .attr("fill","none")
        .attr("d", valueline(data))
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        */

    var legend = svg.selectAll(".legend-"+id)
        .data(c_domain_arr)
        .enter().append("g")
        .classed("legend-"+id, true)
        .attr("transform", function(d, i) {
            return "translate(0," + i * 20 + ")";
        });


    /*
    jQuery.get("./predict.json",function(data){
        linedata = parseLineData(data)

            valueline = d3.svg.line()
            .interpolate("basis")   
            .x(function(d) { return x(d["cbcl_scr_syn_anxdep_t"]); })
            .y(function(d) { return y(d.fit); });

        objects
            .append("path")
            .attr("class", "line")
            .attr("stroke","steelblue")
            .attr("stroke-width",2)
            .attr("fill","none")
            .attr("d", valueline(linedata));
    });
    */
    if(jQuery(window).width() < 400){
        legend.append("rect")
            .attr("x", 10)
            .attr("y", height+20)
            .attr("width", 12)
            .attr("height", 12)
            .style("fill", function(d,i){ return color(c_domain_arr.indexOf(d+""));});
        legend.append("text")
            .attr("x", 26)
            .attr("y", height+20)
            .attr("dy", ".65em")
            .text(function(d) {
                return d;
            });
    }else{ 
        legend.append("rect")
            .attr("x", width + 10)
            .attr("width", 12)
            .attr("height", 12)
            .style("fill", function(d,i){ return color(c_domain_arr.indexOf(d+""));});
        legend.append("text")
            .attr("x", width + 26)
            .attr("dy", ".65em")
            .text(function(d) {
                return d;
            });
    }
    legend.on("click", function(type) {
        type_label = type.split(/[^a-zA-Z0-9]/).join("");
        console.log(type_label);
        if(d3.select(this).attr("clicked") == "T"){
            d3.select(this)
                .attr("clicked","F");
            d3.selectAll(".legend-"+id)
                .style("opacity", 1);
            d3.selectAll(".scatter-dot-"+id)
                .style("opacity", 0.8)
                .style("stroke", function(){d3.select(this).attr("fill") })
            d3.selectAll(".line-"+id)
                .style("opacity", 1);
            d3.selectAll(".area-"+id)
                .style("fill-opacity", 0.2);
            d3.selectAll(".bar-marginal-"+id)
                .style("opacity", 1)
            return
        }
        // dim all of the icons in legend
        d3.selectAll(".legend-"+id)
            .style("opacity", 0.1)
            .attr("clicked","F")
        // make the one selected be un-dimmed
        d3.select(this)
            .style("opacity", 1)
            .attr("clicked","T");
        // select all dots and apply 0 opacity (hide)
        d3.selectAll(".scatter-dot-"+id)
            .transition()
            .duration(0)
            .style("opacity", 0.1)
        // filter out the ones we want to show and apply properties
            .filter(function(d) {
                return d[group] == type;
            })
            .style("opacity", 0.8)

        d3.selectAll(".bar-marginal-"+id)
            .style("opacity", 0)
            .attr("clicked","F")

        d3.selectAll(".bar-marginal-id-"+type_label)
            .style("opacity", 1)

        d3.selectAll(".line-"+id)
            .style("opacity", 0)
            .attr("clicked","F")

        d3.selectAll(".line-id-"+type_label)
            .style("opacity", 1);

        d3.selectAll(".area-"+id)
            .style("fill-opacity", 0)
            .attr("clicked","F")

        d3.selectAll(".area-"+type_label)
            .style("fill-opacity", 0.2);

    });

    d3.select("button.reset").on("click", change)

    function change() {
        xMax = d3.max(data, function(d) {
            return d[xCat];
        });
        xMin = d3.min(data, function(d) {
            return d[xCat];
        });
        zoomBeh.x(x.domain([xMin, xMax])).y(y.domain([yMin, yMax]));

        var svg = d3.select("#scatter").transition();
        svg.select(".x.axis").duration(0).call(xAxis).select(".label").text(labels[xCat]);
        objects.selectAll(".scatter-dot-"+id).transition().duration(0)
            .attr({
                r: function(d) {
                    return 4;
                },
                cx: function(d) {
                    return x(d[xCat]);
                },
                cy: function(d) {
                    return y(d[yCat]);
                }
            })

        objects.selectAll(".line-"+id).transition()
            .attr("d", valueline(linedata))
    }

    function zoom() {
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);
        d3.select(".plot-"+id)
            .selectAll(".line-"+id)
            .remove()
        d3.select(".plot-"+id)
            .selectAll(".conf-area")
            .remove()
        d3.select(".plot-"+id)
            .selectAll(".bar-marginal-"+id)
            .remove()
        for(item  in line_data){
            if(item == "shuffle") continue;
            tld = line_data[item];
            if(tld.length == 3){
                predict_conf_interval(id,tld,color(c_domain_arr.indexOf(""+item)),item.split(/[^a-zA-Z0-9]/).join(""))
                barplot_marginal(id,color(c_domain_arr.indexOf(""+item)),item.split(/[^a-zA-Z0-9]/).join(""),item) 
            }
            else{
                barplot_marginal(id,"steelblue",item.split(/[^a-zA-Z0-9]/).join(""),item)
            }
            for(item_s in tld){
                var line_col = color(c_domain_arr.indexOf(""+item));
                if(item_s == "shuffle") continue;
                //if(item_s == 1)  line_col = "black";
                if(item_s+1 == tld.length)  line_col = "black";
                predict_line(id,tld[item_s],line_col,item.split(/[^a-zA-Z0-9]/).join(""))
            }
        }
        for( it in c_domain_arr){
            item = c_domain_arr[it];
            barplot_marginal(id,color(c_domain_arr.indexOf(""+item)),item.split(/[^a-zA-Z0-9]/).join(""),item)
        }
        svg.selectAll(".scatter-dot-"+id)
            .attr({
                cx: function(d) {
                    return x(d[xCat]);
                },
                cy: function(d) {
                    return y(d[yCat]);
                }
            })
        //     .attr("transform", transform);

    }

    function transform(d) {
        return "translate(" + x(d[xCat]) + "," + y(d[yCat]) + ")";
    }


}
