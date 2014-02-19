var maxValue = 0;
var dataLength = 0;
var dataJSON = {};
var filenames = {'BiasMatrix.tsv':'CancerSeq', 'GC_BiasMatrix.DARPA.tsv':'DARPA', 'RiboZero_CommonMind.tsv':'CommonMind'};
var highlighted = {'BiasMatrix.tsv':false, 'GC_BiasMatrix.DARPA.tsv': false, 'RiboZero_CommonMind.tsv':false};
var count = 0; 

function processData(filename) {
    d3.tsv(filename, function(error, data) {
        count++;
        var fileData= Object();
        data.forEach(function(row) {
            for(var column in row) {
                if(column != "" && !fileData[column]) {
                    fileData[column] = [];
                }
                if(column != "") {
                   if(parseFloat(row[column]) > maxValue) {
                      maxValue = row[column];
                   } 
                   fileData[column].push(row[column]);
                   if(parseFloat(fileData[column].length) > dataLength) {
                       dataLength = fileData[column].length;
                   }
                } 
            }
        });

        dataJSON[filename] = fileData;
        if(count == Object.keys(filenames).length) {
            drawGraph();
        }
        window.onresize = function() {
            if(count == Object.keys(filenames).length) {
                drawGraph();
            }
        }
        
        function drawGraph() {
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

            var xAxis = d3.svg.axis().scale(x);

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
        
        //GRAPHING THE LINES
            for (var filename in dataJSON) {
                for (var name in dataJSON[filename]) {
                    var d = dataJSON[filename][name]; 
                    var line = d3.svg.line()
                        .x(function(k,i) {
                            return x(i);
                        })
                        .y(function(k) {
                            return 0;
                        })
                    if(highlighted[filename.substring(8)]) {
                        graph.append("path")
                            .attr("d", line(d))
                            .attr("id", name)
                            .attr("class", filenames[filename.substring(8)] + " highlight")
                            .on("mouseover", onmouseover)
                            .on("mouseout", onmouseout);
                    } else {
                         graph.append("path")
                            .attr("d", line(d))
                            .attr("id", name)
                            .attr("class", filenames[filename.substring(8)])
                            .on("mouseover", onmouseover)
                            .on("mouseout", onmouseout);
                    }
                } 
            }
        }
        $(document).ready(function() {
            $('#filters a').click(function() {
                if(this.id == filenames[filename.substring(8)]) {
                    var highlightClass = $(this).attr("id");
                    $(this).toggleClass(highlightClass);                              // 
                    highlightFile(highlightClass);                                    //  
                }
            });
        });

        function highlightFile(highlightClass) {
             var lines = d3.selectAll("path." + highlightClass);
             if (lines.classed('highlight')) {
                 lines.attr("class", highlightClass);
                 highlighted[filename.substring(8)] = false;
             } else {
                 lines.classed('highlight', true);
                 highlighted[filename.substring(8)] = true;
             }
        }

        function onmouseover() {
            var currClass = d3.select(this).attr("class");
            var name = this.id; 
            d3.select(this)
                .attr("class", currClass + " current");
            var blurb = '<h2>' + name + '</h2>';
            $("#default").hide();
            $("#blurb").html(blurb);
        }

        function onmouseout() {
           var currClass = d3.select(this).attr("class");
           var prevClass = currClass.substring(0, currClass.length - 8);
           d3.select(this)
              .attr("class", prevClass);
           $("#default").show();
           $("#blurb").html('');
        } 
    });
}

for(var filename in filenames) {
    var filters = document.getElementById("filters");
    addFilter(filters, filenames[filename]);
    processData('/static/' + filename);
}

function addFilter(filters, tagName) {
    filters.innerHTML += "<a id=" + tagName + " class>" + tagName + "</a>";
}  



