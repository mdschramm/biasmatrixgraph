/* ======== LOAD DATA FROM BiasMatrix.tsv ======== */

d3.tsv("/static/BiasMatrix.tsv", function(error, data) {
    var dataJSON = Object();
    var dataLength;
    var maxValue = 0;
    data.forEach(function(d) {
        for (var rna in d) {
            if(!dataJSON[rna] && rna != "") {
                dataJSON[rna] = [];
            }
            if(rna != "") {
                if(parseFloat(d[rna]) > maxValue) {
                    maxValue = d[rna];
                }
                dataJSON[rna].push(d[rna]);
                dataLength = dataJSON[rna].length;
            } 
        }
    });

    buttonsToColors = new Object();
    var graphed = [];
    drawGraph(true, buttonsToColors, graphed);
    window.onresize = function() {
        drawGraph(false, buttonsToColors, graphed);
    }
    
    
    function drawGraph(isFirstTime, buttonsToColors, graphed) {
        d3.select("#chart").remove();    
        var m = [40, 80, 80, 80];
        var w = window.innerWidth*0.75 - m[0];
        var h = window.innerHeight*0.75 - m[1];
        var x = d3.scale.linear().domain([0, dataLength + 50]).range([0, w]);
        var y = d3.scale.linear().domain([0, maxValue]).range([h, 0]);
        d3.select("#chart").attr("viewbox", "0 0 " + w + " " + h);
        d3.select("#chart").attr("preserveAspectRatio", "xMidYMid meet");
     

        var graph = d3.select("#graph").append("svg:svg")
            .attr("id", "chart")
            .attr("width", w + m[1]) 
            .attr("height", h + m[0] + m[2])
            .append("svg:g")
            .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

        var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);

        graph.append("svg:g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);

        var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");

        graph.append("svg:g")
            .attr("class", "y axis")
            .attr("transform", "translate(-10, 0)")
            .call(yAxisLeft);

        graph.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("y", -55)
            .attr("x", -h/2)
            .attr("transform", "rotate(-90)")
            .style("font-size", 18)
            .text("Coverage")
    
        graph.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("y", h + m[0])
            .attr("x", m[1] + w/2)
            .style("font-size", 18)
            .text("Distance from 3' end")
    

        Colors = {};
        Colors.names = {
            aqua: "#00ffff",
        //    azure: "#f0ffff",
            black: "#000000",
            blue: "#0000ff",
        //    brown: "#a52a2a",
        //  cyan: "#00ffff",
        //  darkblue: "#00008b",
            darkcyan: "#008b8b",
        //  darkgrey: "#a9a9a9",
        //darkgreen: "#006400",
            darkkhaki: "#bdb76b",
            darkmagenta: "#8b008b",
        //   darkolivegreen: "#556b2f",
            darkorange: "#ff8c00",
            darkorchid: "#9932cc",
            darkred: "#8b0000",
            darksalmon: "#e9967a",
        //    darkviolet: "#9400d3",
        //   fuchsia: "#ff00ff",
            gold: "#ffd700",
            green: "#008000",
        //   indigo: "#4b0082",
            khaki: "#f0e68c",
            lightblue: "#add8e6",
            lightgreen: "#90ee90",
        //   lightpink: "#ffb6c1",
            lime: "#00ff00",
            magenta: "#ff00ff",
            maroon: "#800000",
            navy: "#000080",
            olive: "#808000",
            orange: "#ffa500",
            pink: "#ffc0cb",
        //   purple: "#800080",
            violet: "#800080",
            red: "#ff0000",
            silver: "#c0c0c0",
        };
    
    
        Colors.random = function() {
            var result;
            var count = 0;
            for (var prop in this.names) {
                if (Math.random() < 1/++count) {
                    result = prop;
                }
            }
            return result;
        }

/* =========== ADDING IN CHECKBOXES AND LABELS ============ */    

        var usedColors = []; 
        var container = document.getElementById("checkboxes");
        var startList = "<ol>";
        var endList = "</ol>";
        var list = "";
        if(isFirstTime) {
            for (var name in dataJSON) {
                var c = Colors.random();
                var count;
                while(usedColors.indexOf(c) > -1) {
                    c = Colors.random();
                    count++;
                    if (count > Object.keys(Colors).length) {
                        c = "#"+((1<<24)*Math.random()|0).toString(16);
                    }
                }
                buttonsToColors[name] = c;
                usedColors.push(c);
                list += "<li><input type=checkbox class=\"btn btn-small btn-round\" id=" + name + "><label id=" + name + "label style=color:" +
                    c + ">" + name + "</label></li>"; 
            
            }
        } else {
            for (var name in buttonsToColors) {
                usedColors.push(buttonsToColors[name]);
                list += "<li><input type=checkbox class=\"btn btn-small btn-round\" id=" + name + "><label id=" + name + "label style=color:" +
                    buttonsToColors[name] + ">" + name + "</label></li>";
            }
        }
        list += "<li><input type=checkbox id=all><label>All</label></li>"
        container.innerHTML = startList + list + endList;
        for (var i = 0; i < graphed.length; i++) {
            document.getElementById(graphed[i]).checked = true;
            drawLine(graphed[i]);
        }
    


    /* =============== GRAPH/REMOVE LINE WHEN CHECKBOX IS CLICKED ===================*/
                var checkboxes = document.getElementsByTagName('input');
                    for(var i = 0; i < checkboxes.length; i++) {
                        checkboxes[i].onclick = function() {
                            drawLine(this.id);
                        }
                    }
                
            
     function drawLine(name) {
        var checkbox = document.getElementById(name);
        if(checkbox.checked) {
            if(graphed.indexOf(name) < 0) {
                graphed.push(name);
            }
            var d = dataJSON[name];
            var line = d3.svg.line()
                .x(function(k,i) {
                    return x(i);
                })
            .y(function(k) {
                return y(k);
            })
            var color = document.getElementById(name + "label").style.color;
            // Parsing string formatted as rgb(#, #, #) 
            if(color.substring(0,3) == 'rgb') {
                var r = parseInt(color.substring(color.indexOf('(') + 1, color.indexOf(',')));
                var g = parseInt(color.substring(color.indexOf(',') + 2, color.lastIndexOf(',')));
                var b = parseInt(color.substring(color.lastIndexOf(',') + 1, color.indexOf(')')));
                graph.append("path").attr("d", line(d)).attr("id", name + "line").style("stroke", d3.rgb(r,g,b));
            } else graph.append("path").attr("d", line(d)).attr("id", name + "line").style("stroke", color);
        } else {
            graphed.pop(name);
            graph.select("#" + name + "line").remove();
        }
    }
        

/* ============= THE ALL BUTTON ================= */
    document.getElementById('all').onclick = function() {
        if(this.checked) {
            for (var name in dataJSON) {
                document.getElementById(name).checked = true;
                drawLine(name);           
            }
        } else {
            for(var name in dataJSON) {
                graphed.pop(name);
                var elem = document.getElementById(name);
                elem.checked = false;
                graph.selectAll("#" + name + "line").remove();
            }
        }
    }
}
      
});
