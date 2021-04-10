// Adapted from https://bl.ocks.org/heybignick/3faf257bbbbc7743bb72310d03b86ee8
// https://bl.ocks.org/steveharoz/8c3e2524079a8c440df60c1ab72b5d03
// https://bl.ocks.org/denisemauldin/cdd667cbaf7b45d600a634c8ae32fae5
// highlight nodes: https://stackoverflow.com/questions/14600967/d3-force-directed-graph-node-filtering

// variables
const dataUrl = "data/accident.csv";
const width = window.innerWidth;
const height = window.innerHeight;
const svg = d3.select("svg");
let ctx = {

  GRPAH: null,//cause,detail
  INJURY: null,
};

let status = {
  screen: null,
  isDragging: false,
  isHover: false,
  isTooltip: false,
}

let filter = {
  canyonRating: "FR", //"FR","ACA"
}
let injuryList = [];
let nodeNeighbor = [];

const causeType = {
  "Inadequate equipment": "Human error",
  "Rappel error": "Human error",
  "Communication error": "Human error",
  "Anchor error": "Human error",
  "Exposure": "Natural environment",
  "Rockfall": "Natural environment",
  "Panic": "Human error",
  "Rigging error": "Human error",
  "Illness": "Human error",
  "Static block error": "Human error",
  "No backup": "Human error",
  "Solo canyoneering": "Human error",
  "Toboggan error": "Human error",
  "Stuck rope": "Human error",
  "Exhaustion": "Human error",
  "Stuck rope": "Human error",
  "Jumping error": "Human error",
  "Equipment misuse": "Human error",
  "Navigation error": "Human error",
  "Inexperience": "Human error",
  "Hanging upside down": "Human error",
  "Weather": "Natural environment",
  "Worn out equipment": "Human error",
  "Overconfidence": "Human error",
  "Group dynamics": "Human error",
  "Darkness": "Natural environment",
  "Water": "Natural environment",
  "Judgment": "Human error",
  "Fall or slip": "Human error",
  "Failure to retreat": "Human error",
  "Unknown": "Uncategorized",
}

const injuryRating = {
  "Fatality": 11,
  "Hypothermia": 10,//失溫
  "Amputation": 9,//截肢
  "Fracture": 8,//斷裂
  "Sprain or Strain": 7,//扭傷或拉傷
  "Abrasion or Laceration": 6,//擦傷或割傷
  "Concussion or Head Trauma": 5,//腦震盪
  "Bruise": 4,//瘀青
  "Dislocation": 3,
  "Psychological": 2,
  "No Injury or Near Miss": 1,
  "Others": 0,
}


//var color = d3.scaleOrdinal(d3.schemeCategory20);


// setup



// https://stackoverflow.com/a/54466624

d3.csv(dataUrl).then(function (accidentData) {

  let filteredData;
  let detailedData;

  draw(accidentData);
  // TODO
  d3.select('#injury-option')
    .on('change', function () {
      let value = d3.select(this).property('value');
      ctx.INJURY = value;
      filteredData = accidentData.filter(function (d) {
        return d["injury"].includes(ctx.INJURY);
      })
      draw(getNetworkData(filteredData));
    });
  /*
    d3.selectAll(".node").on("click", function () {
      d3.selectAll(".tooltip").attr("show", false);
      let cause = d3.select(this).attr('title');
      let regex = "/" + cause + "/";
      let causeData;
      if (ctx.INJURY === null) {
        causeData = accidentData.filter(function (d) {
          return d["cause"].includes(cause);
        });
      } else {
        causeData = accidentData.filter(function (d) {
          return d["cause"].match(regex) && d["injury"].includes(ctx.INJURY);
        });
      }
      detailedData = getTreeData(causeData, cause);
      drawDetail(detailedData, cause);
    })
    */

  drawFilter(injuryList);

});


// draw main network diagram
// https://bl.ocks.org/heybignick/3faf257bbbbc7743bb72310d03b86ee8
function draw(data) {

  svg.attr("id", "main-chart");

  let network = getNetworkData(data);

  ctx.GRPAH = "cause";
  status.screen = "cause";

  d3.selectAll("line").exit();
  d3.select(".nodes").selectAll("g").exit();
  svg.selectAll("*").remove();


  svg.attr("viewBox", [-width / 2, -height / 2, width, height]);




  const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id))
    .force("charge", d3.forceManyBody().strength(-400))
    .force("center", d3.forceCenter(0, 0))
    .force("collide", d3.forceCollide().strength(0.5).radius(function (d) { return Math.sqrt(d.value) * 15 + 20; })) // radius
    //.force("collide", d3.forceCollide().strength(0.5).radius(80)) // radius
    .force("x", d3.forceX().x(d => d.x))
    .force("y", d3.forceY(height / 2));

    /*
    .force("bounding-box", () => {

      nodes.forEach(node => {
        if (isOutside(node).boolean) {
          let offset = 4;
          if (isOutside(node).position.horizontal === "left") {
            node.x = node.x + offset;
          } else if (isOutside(node).position.horizontal === "right") {
            node.x = node.x - offset;
          } else {
            node.x = node.x;
          }
          if (isOutside(node).position.vertical === "top") {
            node.y = node.y + offset;
          } else if (isOutside(node).position.vertical === "bottom") {
            node.y = node.y - offset;
          } else {
            node.y = node.y;
          }
        }
      })


    });
*/
  //.force("box_force",box_force());
  /*
  .force("bouding-box", () => {
    let nodes = d3.selectAll(".node")._groups[0];
    for(i = 0; i<nodes.length; i++ ){
      if (isOutside(nodes[i])){
        d3.select(nodes[i]).x = 0;
        d3.select(nodes[i]).y = 0
      };
    };
  });
  */
  /*
    //custom force to put stuff in a box 
    function box_force() {
      for (var i = 0, n = data.nodes.length; i < n; ++i) {
        let curr_node = data.nodes[i];
        curr_node.x = Math.max(function (d) { return Math.sqrt(d.value) * 15 }, Math.min(width - function (d) { return Math.sqrt(d.value) * 15 }, curr_node.x));
        curr_node.y = Math.max(function (d) { return Math.sqrt(d.value) * 15 }, Math.min(height - function (d) { return Math.sqrt(d.value) * 15 }, curr_node.y));
      }
    }
  */

  const links = network.links.map(d => Object.create(d));
  const nodes = network.nodes.map(d => Object.create(d));
  //const links = data.links;
  //const nodes = data.nodes; 

  // link
  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("class", "link")
    .attr("source", function (d) { return d.source })
    .attr("target", function (d) { return d.target })
    .attr("stroke-width", function (d) { return Math.sqrt(d.value) * 3; });

  var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .enter().append("g");

  var circles = node.append("circle")
    .attr("r", function (d) { return Math.sqrt(d.value) * 15; })
    //.attr("class", function (d) { return d.group; })
    //.attr("fill", function(d) { return color(d.group); })    
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  let lables = node.append("text")
    .text(function (d) {
      return d.id;
    })
    .attr("text-anchor", "middle")
    .attr("class", "cause-label")
    .attr('x', 0)
    .attr('y', 0)
    .style("font-size", function (d) { return Math.sqrt(d.value) * 4 + "px" });


  //node.append("title")
  //  .text(function (d) { return d.id; })

  node.attr("title", function (d) { return d.id; })
    .attr("class", "node cause")
    .attr("type", function (d) {
      let cause = d.id;
      let type = (causeType[cause] === undefined) ? "Uncategorized" : causeType[cause];
      return type;
    })
    .on("mouseenter", mouseenter)
    .on("mouseleave", mouseleave)
    .on("click", click);


  simulation
    .nodes(nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(links);

  function ticked() {
    link
      .attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; });

    node
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

    /*
     node
       .attr("cx", function (d) { return d.x = Math.max(15, Math.min(width - 15, d.x)); })
       .attr("cy", function (d) { return d.y = Math.max(15, Math.min(height - 15, d.y)); });
 */

  };
  // drag and drop 
  function dragstarted(event, d) {
    status.isDragging = true;
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = event.x;
    d.fy = event.y;
    d3.select('.tooltip').attr("highlighted", false);
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    status.isDragging = false;
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    d3.selectAll(".node").attr("highlighted", null);
    d3.selectAll(".link").attr("highlighted", null);
    d3.select('.tooltip').attr("highlighted", null);
    if (status.isTooltip) {
      d3.select(".tooltip").remove();
    }
  }

  // mouseover and mouseout
  function mouseenter(event, d) {

    if (!status.isDragging) {

      status.isHover = true;

      let targetNode = d3.select(this);
      let cause = d.id;

      // highlight nodes
      d3.selectAll(".node").attr("highlighted", false);
      targetNode.attr("highlighted", true);
      let index = getJsonArrayIndex(nodeNeighbor, "cause", cause);
      if (index !== -1) {
        let causeNeighbors = nodeNeighbor[index].neighbor;
        for (i = 0; i < causeNeighbors.length; i++) {
          d3.select('[title="' + causeNeighbors[i] + '"]').attr("highlighted", true);
        }
      }
      // highlight links
      d3.selectAll(".link").attr("highlighted", false);
      d3.selectAll('[source="' + cause + '"]').attr("highlighted", true);
      d3.selectAll('[target="' + cause + '"]').attr("highlighted", true);
      /*
            // tooltip
            d3.select('.tooltip[cause="' + cause + '"]').attr("show", true)
              .style("top", event.pageY + "px")
              .style("left", event.pageX + "px")
              */

      drawTooltip(network.nodes[d.index], data, cause);


    }


  }
  function mouseleave(event, d) {
    if (!status.isDragging) {
      status.isHover = false;
      d3.selectAll(".node").attr("highlighted", null);
      d3.selectAll(".link").attr("highlighted", null);
      d3.select('.tooltip').remove();
      status.isTooltip = false;
    }

  }

  // click
  function click(d) {

    let clickedNode = d3.select(this);

    if (status.screen === "cause") {

      status.screen = "detail";

      d3.selectAll(".nodes").data(data).exit();
      d3.selectAll(".links").data(data).exit();
      d3.selectAll(".links").remove();
      d3.selectAll('.node:not([title="' + clickedNode.attr("title") + '"])').remove();

      clickedNode
        .on("mouseenter", null)
        .on("mouseleave", null)
        .call(d3.drag()
          .on("start", null)
          .on("drag", null)
          .on("end", null));


      simulation.stop();

      drawDetail(data.filter(function (d) { return d.cause.includes(clickedNode.attr("title")) }), clickedNode.attr("title")); // (data, cause)
      //drawChord(data.filter(function (d) { return d.cause.includes(clickedNode.attr("title")) }));

    } else {
      status.screen = "cause";
      draw(data);
    }

  };

}

// https://www.visualcinnamon.com/2015/08/stretched-chord/
// http://bl.ocks.org/nbremer/c11409af47b5950f0289
function drawChord(data) {
  ////////////////////////////////////////////////////////////
  //////////////////////// Set-up ////////////////////////////
  ////////////////////////////////////////////////////////////
  //var screenWidth = $(window).width();
  let screenWidth = window.innerWidth;
  let mobileScreen = (screenWidth > 400 ? false : true);

  //var margin = {left: 50, top: 10, right: 50, bottom: 10},
  let margin = { left: 00, top: 0, right: 00, bottom: 0 },
    width = Math.min(screenWidth, 800) - margin.left - margin.right,
    height = (mobileScreen ? 300 : Math.min(screenWidth, 800) * 5 / 6) - margin.top - margin.bottom;

  //var svg = d3.select("#main-chart").append("svg")
  //.attr("width", (width + margin.left + margin.right))
  //.attr("height", (height + margin.top + margin.bottom));

  let wrapper = svg;
  //var wrapper = svg.append("g").attr("class", "chordWrapper")
  //.attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");;

  var outerRadius = Math.min(width, height) / 2 - (mobileScreen ? 80 : 100),
    innerRadius = outerRadius * 0.95,
    pullOutSize = (mobileScreen ? 20 : 50),
    opacityDefault = 0.7, //default opacity of chords
    opacityLow = 0.02; //hover opacity of those chords not hovered over

  ////////////////////////////////////////////////////////////
  ////////////////////////// Data ////////////////////////////
  ////////////////////////////////////////////////////////////

  let chordData = getChordData(data);

  //Custom sort function of the chords to keep them in the original order
  function customSort(a, b) {
    return 1;
  };

  //Custom sort function of the chords to keep them in the original order
  var chord = customChordLayout(chordData.matrix) //d3.layout.chord()//Custom sort function of the chords to keep them in the original order
    .padding(.02)
    .sortChords(d3.descending) //which chord should be shown on top when chords cross. Now the biggest chord is at the bottom
    .matrix(chordData.matrix);

  var arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .startAngle(startAngle) //startAngle and endAngle now include the offset in degrees
    .endAngle(endAngle);

  var path = stretchedChord()
    .radius(innerRadius)
    .startAngle(startAngle)
    .endAngle(endAngle)
    .pullOutSize(pullOutSize);

  ////////////////////////////////////////////////////////////
  //////////////////// Draw outer Arcs ///////////////////////
  ////////////////////////////////////////////////////////////

  var g = wrapper.selectAll("g.group")
    .data(chord.groups)
    .enter().append("g")
    .attr("class", "group")
    .on("mouseover", fade(opacityLow))
    .on("mouseout", fade(opacityDefault));

  g.append("path")
    .style("stroke", function (d, i) { return (chordData.names[i] === "" ? "none" : "#00A1DE"); })
    .style("fill", function (d, i) { return (chordData.names[i] === "" ? "none" : "#00A1DE"); })
    .style("pointer-events", function (d, i) { return (chordData.names[i] === "" ? "none" : "auto"); })
    .attr("d", arc)
    .attr("transform", function (d, i) { //Pull the two slices apart
      d.pullOutSize = pullOutSize * (d.startAngle + 0.001 > Math.PI ? -1 : 1);
      return "translate(" + d.pullOutSize + ',' + 0 + ")";
    });


  ////////////////////////////////////////////////////////////
  ////////////////////// Append Names ////////////////////////
  ////////////////////////////////////////////////////////////

  //The text also needs to be displaced in the horizontal directions
  //And also rotated with the offset in the clockwise direction
  g.append("text")
    .each(function (d) { d.angle = ((d.startAngle + d.endAngle) / 2) + chordData.offset; })
    .attr("dy", ".35em")
    .attr("class", "titles")
    .attr("text-anchor", function (d) { return d.angle > Math.PI ? "end" : null; })
    .attr("transform", function (d, i) {
      var c = arc.centroid(d);
      return "translate(" + (c[0] + d.pullOutSize) + "," + c[1] + ")"
        + "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
        + "translate(" + 55 + ",0)"
        + (d.angle > Math.PI ? "rotate(180)" : "")
    })
    .text(function (d, i) { return chordData.names[i]; });

  ////////////////////////////////////////////////////////////
  //////////////////// Draw inner chords /////////////////////
  ////////////////////////////////////////////////////////////

  var chords = wrapper.selectAll("path.chord")
    .data(chord.chords)
    .enter().append("path")
    .attr("class", "chord")
    .style("stroke", "none")
    .style("fill", "#C4C4C4")
    .style("opacity", function (d) { return (chordData.names[d.source.index] === "" ? 0 : opacityDefault); }) //Make the dummy strokes have a zero opacity (invisible)
    .style("pointer-events", function (d, i) { return (chordData.names[d.source.index] === "" ? "none" : "auto"); }) //Remove pointer events from dummy strokes
    .attr("d", path);

  ////////////////////////////////////////////////////////////
  ///////////////////////// Tooltip //////////////////////////
  ////////////////////////////////////////////////////////////

  //Arcs
  g.append("title")
    .text(function (d, i) { return Math.round(d.value) + " people in " + chordData.names[i]; });

  //Chords
  chords.append("title")
    .text(function (d) {
      return [Math.round(d.source.value), " people from ", chordData.names[d.target.index], " to ", chordData.names[d.source.index]].join("");
    });

  ////////////////////////////////////////////////////////////
  ////////////////// Extra Functions /////////////////////////
  ////////////////////////////////////////////////////////////

  //Include the offset in de start and end angle to rotate the Chord diagram clockwise
  function startAngle(d) { return d.startAngle + chordData.offset; }
  function endAngle(d) { return d.endAngle + chordData.offset; }

  // Returns an event handler for fading a given chord group
  function fade(opacity) {
    return function (d, i) {
      svg.selectAll("path.chord")
        .filter(function (d) { return d.source.index !== i && d.target.index !== i && chordData.names[d.source.index] !== ""; })
        .transition("fadeOnArc")
        .style("opacity", opacity);
    };
  }//fade
}


function drawDetail(data, cause) {

  status.isHover = false;
  status.isTooltip = false;
  d3.select(".tooltip").remove();



  svg.attr("id", "detail-chart");
  d3.select('[title = "' + cause + '"]').attr("class", d3.select('[title = "' + cause + '"]').attr("class") + " center-node");

  let network = getAccidentNetworkData(data, cause);


  const links = network.links.map(d => Object.create(d));
  const nodes = network.nodes.map(d => Object.create(d));


  const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id).strength(0))
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(0, 0))
    .force("collide", d3.forceCollide().strength(1).radius(function (d) { return (d.id === "dummy") ? 1 : 20 }))
    .force("r", d3.forceRadial(function (d) {
      let val;
      if (d.id === cause) {
        val = 0;
      } else {
        val = (d.category === "accident") ? 100 : 300
      }
      return val;
    }, 0, -100).strength(2))
    .force("x", d3.forceX())
    .force("y", d3.forceY(function (d) {
      return (d.category === "accident") ? 500 : 300;
    }));


  let link = svg.insert("g", "g.nodes")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("class", function (d) { return (d.target == cause) ? "link dummy" : "link" })
    .attr("source", function (d) { return d.source })
    .attr("target", function (d) { return d.target })
    .attr("stroke-width", 4);


  let node = d3.select(".nodes").selectAll("g")
    .data(nodes)
    .enter().append("g")
    .attr("category", function (d) { return d.category })
    .attr("name", function (d) { return d.id })
    .attr("class", function (d) { return (d.id === "dummy") ? "node dummy" : "node"; });

  d3.selectAll('[category="accident"]').attr("injury-max",function(d){return d.injuryMax});
  d3.selectAll('[category="cause"]').attr("type",function(d){return getCauseType(d.id)});

  

  let circles = node.append("circle")
    .attr("r", function (d) {
      return (d.id === "dummy") ? 1 : 20;
    })
    .on("mouseenter", mouseenter)
    .on("mouseleave", mouseleave)
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  let labels = node.append("text")
    .text(function (d) { return (d.category === "accident") ? d.canyon + " (" + d.date + ")" : d.id; })
    .attr("text-anchor", "middle")
    .attr("class", "label")
    .attr('x', 0)
    .attr('y', 0);


  simulation
    .nodes(nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(links);

  function ticked() {

    link
      .attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; });

    node
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

    /*
     node
       .attr("cx", function (d) { return d.x = Math.max(15, Math.min(width - 15, d.x)); })
       .attr("cy", function (d) { return d.y = Math.max(15, Math.min(height - 15, d.y)); });
  */

  };
  // drag and drop 
  function dragstarted(event, d) {
    status.isDragging = true;
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = event.x;
    d.fy = event.y;
    d3.select(".tooltip").attr("highlighted", false);
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    status.isDragging = false;
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    d3.selectAll(".node").attr("highlighted", null);
    d3.selectAll(".link").attr("highlighted", null);
    d3.select('.tooltip').attr("highlighted", null);
    if (status.isTooltip) {
      d3.select(".tooltip").remove();
    }
  }

  // mouseover and mouseout
  function mouseenter(event, d) {
    // target circle

    if (!status.isDragging) {

      status.isHover = true;

      let targetCircle = d3.select(this);
      let targetNode = d3.select(this.parentNode);

      // highlight nodes
      d3.selectAll(".node").attr("highlighted", false);
      targetNode.attr("highlighted", true);
      d3.select(".center-node").attr("highlighted", true);


      if (targetNode.attr("category") === "accident") {
        // highlight cause
        let index = getJsonArrayIndex(data, "id", d.id); // find accident data from dataset
        for (i = 0; i < data[index].detailCause.split(",").length; i++) {
          d3.select('[name="' + data[index].detailCause.split(",")[i] + '"]').attr("highlighted", true);
        }
      } else {
        for (i = 0; i < d.accidents.length; i++) {
          d3.select('[name="' + d.accidents[i] + '"]').attr("highlighted", true);
        }
      }

      // highlight links
      d3.selectAll(".link").attr("highlighted", false);
      d3.selectAll('[source="' + d.id + '"]').attr("highlighted", true);
      d3.selectAll('[target="' + d.id + '"]').attr("highlighted", true);

      if (targetNode.attr("category") === "accident") {
        drawAccidentTooltip(network.nodes[d.index], data);
      }


    }


  }
  function mouseleave(event, d) {
    if (!status.isDragging) {
      status.isHover = false;
      d3.selectAll(".node").attr("highlighted", null);
      d3.selectAll(".link").attr("highlighted", null);
      d3.select('.tooltip').remove();
      status.isTooltip = false;
    }

  }


}

function drawDetailxxx(data, cause) {


  ctx.GRPAH = "detail";
  svg.selectAll("*").remove();


  const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().distance(30).strength(1))
    .force("charge", d3.forceManyBody().strength(-400))
    .force("center", d3.forceCenter())
    .force("collide", d3.forceCollide().strength(0.08).radius(25))
    .force("x", d3.forceX())
    .force("y", d3.forceY());

  const root = d3.hierarchy(data);
  const links = root.links();
  const nodes = root.descendants();

  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("class", "link")
    .attr("stroke-width", function (d) { return Math.sqrt(d.value); });

  var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .enter().append("g")

  var circles = node.append("circle")
    .attr("r", 10)
    //.attr("class", function (d) { return d.group; })
    //.attr("fill", function(d) { return color(d.group); })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  let lables = node.append("text")
    .text(function (d) {
      return d.data.name;
    })
    .attr("class", "detail-label")
    .attr('x', 6)
    .attr('y', 3);

  node.append("title")
    .text(function (d) { return d.data.name; });

  node.attr("title", function (d) { return d.id; })
    //.attr("class", d => d.children ? "node internal" : "node leaf" );
    .attr("class", function (d) {
      if (d.children && d.data.name === cause) {
        return "node cause"
      } else if (d.children) {
        return "node accident"
      } else {
        return "node detail-cause"
      }
    });

  simulation
    .nodes(nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(links);

  function ticked() {
    link
      .attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; });

    node
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      })
  }
  // drag and drop
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

}

function drawFilter(array) {
  let select = d3.select("#injury-option");
  for (i = 0; i < array.length; i++) {
    select.append("option").attr("value", array[i]).html(array[i]);
  }
}

function drawTooltip(nodeData, data, cause) {

  if (status.isHover && status.screen === "cause") {

    status.isTooltip = true;

    let tooltip = d3.select("body").append("div")
      .attr("class", "tooltip main-cause-tooltip")
      .attr("cause", nodeData.id)
      .attr("type", (causeType[nodeData.id] === undefined) ? "Uncategorized" : causeType[nodeData.id]);

    let tooltipTitle = tooltip.append("div").attr("class", "tooltip-title");
    tooltipTitle.append("h4").html(nodeData.id);
    tooltipTitle.append("span").attr("class", "cause-type").html((causeType[nodeData.id] === undefined) ? "Uncategorized" : causeType[nodeData.id])
    let tooltipList = tooltip.append("div").attr("class", "tooltip-list");
    tooltipList.append("div").attr("class", "accident-number");
    d3.selectAll(".accident-number").append("div").html("Accident Numbers");
    d3.selectAll(".accident-number").append("div").html(nodeData.value);


    /* draw small injury diagram start*/
    // https://observablehq.com/@eesur/d3-single-stacked-bar

    // set up data
    let injuryData = [];
    let total = nodeData.value;
    //let total = d3.sum(injuryData, d => d.value);

    // for each accident
    for (i = 0; i < nodeData.accidents.length; i++) {

      let injuryIndex = getJsonArrayIndex(injuryData, "injury", data[i].injuryMax);
      if (injuryIndex === -1) {
        // push
        injuryData.push({
          "injury": data[i].injuryMax,
          "injuryValue": injuryRating[data[i].injuryMax],
          "value": 1,
        });
      } else {
        // change value
        let originValue = injuryData[injuryIndex].value;
        injuryData[injuryIndex].value = originValue + 1;
      }
    }

    injuryData.sort(function (a, b) { return -a.injuryValue - -b.injuryValue });
    /*
        // add cumulative and percentage in injury dataset    
        for (j = 0; j < injuryData.length; j++) {
          if (j = 0) {
            injuryData[j].cumulative= 0;
          } else {
            injuryData[j].cumulative = 0;
          }
        }
    
    */
    // draw
    // https://codepen.io/nlounds/pen/GzKwt

    let injurySvg = tooltip.append("div").attr("class", "injury-chart")
      .append("svg")
      .attr("viewBox", "0 0 50 20")
    //.attr("preserveAspectRatio", "xMidYMid meet");
    let injuryBar = injurySvg.selectAll("g")
      .data(injuryData)
      .enter().append("g")
      .attr("injury-max", function (d) { return d.injury });

    let percentSoFar = 0;
    injuryBar.append("rect")
      .attr("height", "5px")
      .attr("width", function (d) { return ((d.value / total) * 100) + "%" })
      .attr("y", 0)
      .attr("x", function (d) {
        let prePrecent = percentSoFar;
        let thisPrecent = (d.value / total) * 100;
        percentSoFar = percentSoFar + thisPrecent;
        return prePrecent + "%";
      })

    injuryBar.append("text").text(function (d) { return d.injury })
      .attr("y", 8)
      .attr("x", function (d) { return d3.select('[injury-max = "' + d.injury + '"] rect').attr("x") });


    //injuryLabel.style("transform","translate(300,150) rotate(0)");

    /*
    tooltip.append("svg")
    .attr("viewbox", "0 0 50 100")
    //
    .append("g");
    */



    /* determine tooltip position start */
    let nodeCoords = getCoords('[title="' + cause + '"] circle');
    let svgCoords = getCoords("#main-chart");
    let tooltipCoords = getCoords(".tooltip");

    // left = x, top = y
    // find center coordinates
    let centerCoords = {
      cx: (nodeCoords.right - nodeCoords.left) / 2 + nodeCoords.left,
      cy: (nodeCoords.bottom - nodeCoords.top) / 2 + nodeCoords.top,
    }

    // determine x
    let tooltipX;
    if (centerCoords.cx > svgCoords.x + svgCoords.width / 2) { // at right      
      tooltipX = nodeCoords.x - tooltipCoords.width - 20;
    } else { // at left      
      tooltipX = nodeCoords.right + 20;
    }
    // determin y
    tooltipY = centerCoords.cy - tooltipCoords.height / 2;
    if (tooltipY < svgCoords.y) { // if the top of tooltip is above svg top
      tooltipY = svgCoords.y + 20;
    } else if (tooltipY + tooltipCoords.height > svgCoords.y + svgCoords.height) { // if the bottom of the tooltip is more than svg bottom
      tooltipY = svgCoords.y + svgCoords.height - tooltipCoords.height - 20;
    }

    // set up inline postion
    tooltip
      .style("left", tooltipX + "px")
      .style("top", tooltipY + "px");

    /* determine tooltip position end */

  }

}


function drawAccidentTooltip(nodeData, data) {

  if (status.isHover && status.screen === "detail" && nodeData.category === "accident" && !status.isTooltip) {

    status.isTooltip = true;

    let tooltip = d3.select("body").append("div")
      .attr("class", "tooltip accident-tooltip")
      .attr("name", nodeData.id)

    let tooltipTitle = tooltip.append("div").attr("class", "tooltip-title");
    tooltipTitle.append("h4").html(nodeData.canyon);
    //tooltipTitle.append("span").attr("class", "date").html(nodeData.date);

    let tooltipList = tooltip.append("div").attr("class", "tooltip-list");
    // date
    tooltipList.append("div").attr("class", "date");
    d3.select(".date").append("div").html("Date");
    d3.select(".date").append("div").html(nodeData.date);
    // location
    tooltipList.append("div").attr("class", "location");
    d3.select(".location").append("div").html("Location");
    let locationString = d3.select(".location").append("div");
    if (nodeData.canyonUrl.includes("http")) {
      locationString.html('<a href="' + nodeData.canyonUrl + '" target="_blank">' + nodeData.canyon + '</a>, ' + nodeData.area + ', ' + nodeData.country);
    } else {
      locationString.html(nodeData.canyon + ', ' + nodeData.area + ', ' + nodeData.country);
    }
    // canyon rating
    tooltipList.append("div").attr("class", "rating");
    d3.select(".rating").append("div").html("Canyon Rating");
    d3.select(".rating").append("div").html((filter.canyonRating === "FR") ? nodeData.canyonRatingFR : nodeData.canyonRatingACA);




    /* determine tooltip position start */
    let nodeCoords = getCoords('[name="' + nodeData.id + '"] circle');
    let svgCoords = getCoords("#detail-chart");
    let tooltipCoords = getCoords(".tooltip");

    // left = x, top = y
    // find center coordinates
    let centerCoords = {
      cx: (nodeCoords.right - nodeCoords.left) / 2 + nodeCoords.left,
      cy: (nodeCoords.bottom - nodeCoords.top) / 2 + nodeCoords.top,
    }

    // determine x
    let tooltipX;
    if (centerCoords.cx > svgCoords.x + svgCoords.width / 2) { // at right      
      tooltipX = nodeCoords.x - tooltipCoords.width - 20;
    } else { // at left      
      tooltipX = nodeCoords.right + 20;
    }
    // determin y
    tooltipY = centerCoords.cy - tooltipCoords.height / 2;
    if (tooltipY < svgCoords.y) { // if the top of tooltip is above svg top
      tooltipY = svgCoords.y + 20;
    } else if (tooltipY + tooltipCoords.height > svgCoords.y + svgCoords.height) { // if the bottom of the tooltip is more than svg bottom
      tooltipY = svgCoords.y + svgCoords.height - tooltipCoords.height - 20;
    }

    // set up inline postion
    tooltip
      .style("left", tooltipX + "px")
      .style("top", tooltipY + "px");

    /* determine tooltip position end */

  }

}

// https://www.visualcinnamon.com/2015/08/stretched-chord/
// http://bl.ocks.org/nbremer/c11409af47b5950f0289
function customChordLayout(matrix) {
  var ε = 1e-6, ε2 = ε * ε, π = Math.PI, τ = 2 * π, τε = τ - ε, halfπ = π / 2, d3_radians = π / 180, d3_degrees = 180 / π;
  var chord = {}, chords, groups, matrix, n, padding = 0, sortGroups, sortSubgroups, sortChords;
  function relayout() {
    var subgroups = {}, groupSums = [], groupIndex = d3.range(n), subgroupIndex = [], k, x, x0, i, j;
    chords = [];
    groups = [];
    k = 0, i = -1;
    while (++i < n) {
      x = 0, j = -1;
      while (++j < n) {
        x += matrix[i][j];
      }
      groupSums.push(x);
      subgroupIndex.push(d3.range(n).reverse());
      k += x;
    }
    if (sortGroups) {
      groupIndex.sort(function (a, b) {
        return sortGroups(groupSums[a], groupSums[b]);
      });
    }
    if (sortSubgroups) {
      subgroupIndex.forEach(function (d, i) {
        d.sort(function (a, b) {
          return sortSubgroups(matrix[i][a], matrix[i][b]);
        });
      });
    }
    k = (τ - padding * n) / k;
    x = 0, i = -1;
    while (++i < n) {
      x0 = x, j = -1;
      while (++j < n) {
        var di = groupIndex[i], dj = subgroupIndex[di][j], v = matrix[di][dj], a0 = x, a1 = x += v * k;
        subgroups[di + "-" + dj] = {
          index: di,
          subindex: dj,
          startAngle: a0,
          endAngle: a1,
          value: v
        };
      }
      groups[di] = {
        index: di,
        startAngle: x0,
        endAngle: x,
        value: (x - x0) / k
      };
      x += padding;
    }
    i = -1;
    while (++i < n) {
      j = i - 1;
      while (++j < n) {
        var source = subgroups[i + "-" + j], target = subgroups[j + "-" + i];
        if (source.value || target.value) {
          chords.push(source.value < target.value ? {
            source: target,
            target: source
          } : {
            source: source,
            target: target
          });
        }
      }
    }
    if (sortChords) resort();
  }
  function resort() {
    chords.sort(function (a, b) {
      return sortChords((a.source.value + a.target.value) / 2, (b.source.value + b.target.value) / 2);
    });
  }
  chord.matrix = function (x) {
    if (!arguments.length) return matrix;
    n = (matrix = x) && matrix.length;
    chords = groups = null;
    return chord;
  };
  chord.padding = function (x) {
    if (!arguments.length) return padding;
    padding = x;
    chords = groups = null;
    return chord;
  };
  chord.sortGroups = function (x) {
    if (!arguments.length) return sortGroups;
    sortGroups = x;
    chords = groups = null;
    return chord;
  };
  chord.sortSubgroups = function (x) {
    if (!arguments.length) return sortSubgroups;
    sortSubgroups = x;
    chords = null;
    return chord;
  };
  chord.sortChords = function (x) {
    if (!arguments.length) return sortChords;
    sortChords = x;
    if (chords) resort();
    return chord;
  };
  chord.chords = function () {
    if (!chords) relayout();
    return chords;
  };
  chord.groups = function () {
    if (!groups) relayout();
    return groups;
  };
  return chord;
};

// https://www.visualcinnamon.com/2015/08/stretched-chord/
// http://bl.ocks.org/nbremer/c11409af47b5950f0289
function stretchedChord() {

  ////////////////////////////////////////////////////////////
  /////////////// Custom Chord Function //////////////////////
  //////// Pulls the chords pullOutSize pixels apart /////////
  ////////////////// along the x axis ////////////////////////
  ////////////////////////////////////////////////////////////
  ///////////// Created by Nadieh Bremer /////////////////////
  //////////////// VisualCinnamon.com ////////////////////////
  ////////////////////////////////////////////////////////////
  //// Adjusted from the original d3.svg.chord() function ////
  ///////////////// from the d3.js library ///////////////////
  //////////////// Created by Mike Bostock ///////////////////
  ////////////////////////////////////////////////////////////
  var source = d3_source,
    target = d3_target,
    radius = d3_svg_chordRadius,
    startAngle = d3_svg_arcStartAngle,
    endAngle = d3_svg_arcEndAngle,
    pullOutSize = 0;

  var π = Math.PI,
    halfπ = π / 2;

  function subgroup(self, f, d, i) {
    var subgroup = f.call(self, d, i),
      r = radius.call(self, subgroup, i),
      a0 = startAngle.call(self, subgroup, i) - halfπ,
      a1 = endAngle.call(self, subgroup, i) - halfπ;
    return {
      r: r,
      a0: [a0],
      a1: [a1],
      p0: [r * Math.cos(a0), r * Math.sin(a0)],
      p1: [r * Math.cos(a1), r * Math.sin(a1)]
    };
  }

  function arc(r, p, a) {
    var sign = (p[0] >= 0 ? 1 : -1);
    return "A" + r + "," + r + " 0 " + +(a > π) + ",1 " + (p[0] + sign * pullOutSize) + "," + p[1];
  }


  function curve(p1) {
    var sign = (p1[0] >= 0 ? 1 : -1);
    return "Q 0,0 " + (p1[0] + sign * pullOutSize) + "," + p1[1];
  }

  /*
  M = moveto
  M x,y
  Q = quadratic Bézier curve
  Q control-point-x,control-point-y end-point-x, end-point-y
  A = elliptical Arc
  A rx, ry x-axis-rotation large-arc-flag, sweep-flag  end-point-x, end-point-y
  Z = closepath

  M251.5579641956022,87.98204731514328
  A266.5,266.5 0 0,1 244.49937503334525,106.02973926358392
  Q 0,0 -177.8355222451483,198.48621369706098
  A266.5,266.5 0 0,1 -191.78901944612068,185.0384338992728
  Q 0,0 251.5579641956022,87.98204731514328
  Z
  */
  function chord(d, i) {
    var s = subgroup(this, source, d, i),
      t = subgroup(this, target, d, i);

    return "M" + (s.p0[0] + pullOutSize) + "," + s.p0[1] +
      arc(s.r, s.p1, s.a1 - s.a0) +
      curve(t.p0) +
      arc(t.r, t.p1, t.a1 - t.a0) +
      curve(s.p0) +
      "Z";
  }//chord

  chord.radius = function (v) {
    if (!arguments.length) return radius;
    radius = d3_functor(v);
    return chord;
  };
  chord.pullOutSize = function (v) {
    if (!arguments.length) return pullOutSize;
    pullOutSize = v;
    return chord;
  };
  chord.source = function (v) {
    if (!arguments.length) return source;
    source = d3_functor(v);
    return chord;
  };
  chord.target = function (v) {
    if (!arguments.length) return target;
    target = d3_functor(v);
    return chord;
  };
  chord.startAngle = function (v) {
    if (!arguments.length) return startAngle;
    startAngle = d3_functor(v);
    return chord;
  };
  chord.endAngle = function (v) {
    if (!arguments.length) return endAngle;
    endAngle = d3_functor(v);
    return chord;
  };


  function d3_svg_chordRadius(d) {
    return d.radius;
  }

  function d3_source(d) {
    return d.source;
  }

  function d3_target(d) {
    return d.target;
  }

  function d3_svg_arcStartAngle(d) {
    return d.startAngle;
  }

  function d3_svg_arcEndAngle(d) {
    return d.endAngle;
  }

  function d3_functor(v) {
    return typeof v === "function" ? v : function () {
      return v;
    };
  }

  return chord;

}//stretchedChord


function find_in_object(my_array, my_criteria) {
  return my_array.filter(function (obj) {
    return Object.keys(my_criteria).every(function (key) {
      return (Array.isArray(my_criteria[key]) &&
        (my_criteria[key].some(function (criteria) {
          return (typeof obj[key] === 'string' && obj[key].indexOf(criteria) === -1)
        })) || my_criteria[key].length === 0);
    });
  });
}

// transform raw data to node-link dataset
function getNetworkData(raw) {

  nodeNeighbor = [];

  let network = {
    "nodes": [],
    "links": []
  };

  raw.forEach(function (d) {
    //deal with cause
    let causes = d.cause.split(",").sort();
    let injuries = d.injury.split(",").sort();
    let accident = d.id;


    for (i = 0; i < causes.length; i++) {

      // nodes

      let cause = causes[i];
      let nodeIndex = getJsonArrayIndex(network.nodes, "id", cause);

      if (nodeIndex === -1) {
        // if the node is not exist

        network.nodes.push({
          "id": cause,
          "cause": cause,
          "type": causeType[cause],
          "value": 1,
          "accidents": accident.split(),
        });
      } else {
        // if the node is exist
        let value = network.nodes[nodeIndex].value;
        network.nodes[nodeIndex].value = value + 1;
        network.nodes[nodeIndex].accidents.push(accident);
      }

      // links

      let pairs = getPairs(causes);
      for (j = 0; j < pairs.length; j++) {
        let pair = pairs[j].sort();
        let concatPairStr = pair[0].concat(pair[1]);
        let linkIndex = network.links.findIndex(function (item, k) {
          return item.concatCause === concatPairStr;
        });
        if (linkIndex === -1) {
          network.links.push({
            "source": pair[0],
            "target": pair[1],
            "value": 1,
            "concatCause": concatPairStr,
          });
        } else {
          let linkValue = network.links[linkIndex].value;
          network.links[linkIndex].value = linkValue + 1;
        }

        // push value inside nodeNeighbor        
        pushNodeNeighbor(pair[0], pair[1]);
        pushNodeNeighbor(pair[1], pair[0]);

      }
    }
    // deal with injury
    for (i = 0; i < injuries.length; i++) {
      if (injuryList.indexOf(injuries[i]) === -1) {
        injuryList.push(injuries[i]);
      }
    };
  });

  return network;
}

// transform raw data to detailed node-link dataset (accident and cause)
function getAccidentNetworkData(data, cause) {

  let network = {
    "nodes": [],
    "links": []
  };

  let accidentNodes = [];
  let causeNodes = [];

  // for center cause node
  causeNodes.push({
    "id": cause,
    "name": cause,
    "category": "cause",
    "value": 1,
    //"accidents": d.id.split(),
  });

  data.forEach(function (d) {

    // accident nodes
    accidentNodes.push({
      "id": d.id, // accident id
      "name": d.canyon,
      "canyon": d.canyon,
      "value": 1,
      "category": "accident",
      "date": d.date,
      "detailCause": d.detailCause,
      "injury": d.injury.split(),
      "injuryMax": d.injuryMax,
      "injuryValue": injuryRating[d.injuryMax],
      "area": d.area,
      "country": d.country,
      "canyonRatingACA": d.difficultyACA,
      "canyonRatingFR": d.difficultyFR,
      "hasSwiftWater": d.hasSwiftWater,
      "canyonUrl": d.canyonUrl,
      "accidentUrl": d.url,

    })


    let detailCauses = d.detailCause.split(",").sort();
    for (i = 0; i < detailCauses.length; i++) {

      // cause nodes
      let detailCause = detailCauses[i];

      if (detailCause !== cause) {
        // if detail cause equals selected cause, then do not do anything
        let nodeIndex = getJsonArrayIndex(causeNodes, "id", detailCause);

        if (nodeIndex === -1) {
          // if the node is not exist

          causeNodes.push({
            "id": detailCause,
            "name": detailCause,
            "category": "cause",
            "value": 1,
            "accidents": d.id.split(),
          });
        } else {
          // if the node is exist
          let value = causeNodes[nodeIndex].value;
          causeNodes[nodeIndex].value = value + 1;
          causeNodes[nodeIndex].accidents.push(d.id);
        }

        // links

        network.links.push({
          "source": d.id,
          "target": detailCause,
          "value": 1,
        });

      }

    }
    // source = accident, target = main cause
    network.links.push({
      "source": d.id,
      "target": cause,
      "value": 1,
    });
  });


  accidentNodes.sort(function (a, b) { return -a.injuryValue - -b.injuryValue });


  let dummyAccidents = new Array(accidentNodes.length).fill({
    "id": "dummy",
    "name": "Dummy",
    "category": "accident",
    "value": 0,
  });

  let dummyCauses = new Array(causeNodes.length).fill({
    "id": "dummy",
    "name": "Dummy",
    "category": "cause",
    "value": 0,
  });

  //network.nodes = network.nodes.concat(dummyCauses).concat(causeNodes).concat(dummyAccidents).concat(accidentNodes);

  network.nodes = causeNodes.concat(accidentNodes);
  //let causeIndex = getJsonArrayIndex(network.nodes, "id", cause);
  //array_move(network.nodes, causeIndex, 0); // array_move(arr, old_index, new_index)
  //network.nodes.splice(causeIndex, 1); // remove the selected cause node

  return network;
}

function getTreeData(data, cause) {


  let treeData = {
    "name": cause,
    "children": [],
  }

  data.forEach(function (d) {
    let detailCauses = d.detailCause.split(",").sort();
    let causeArr = [];
    for (i = 0; i < detailCauses.length; i++) {
      causeArr.push({
        "name": detailCauses[i],
        "value": 1,
      })
    }
    treeData.children.push({
      "name": d.id,
      "children": causeArr,
    })
  });


  return treeData;
}

function getChordData(data) {

  let accidents = [];
  let detailCauses = [];
  data.forEach(function (d) {

    accidents.push(d.id);

    for (i = 0; i < d.detailCause.split(",") < length; i++) {
      let detailCause = d.detailCause.split(",")[i];
      let detailCausesIndex = detailCauses.indexOf(detailCause);

      if (detailCausesIndex === -1) {
        detailCauses.push(d.detailCause.split(",")[i]);
      }

    }

  });

  let names = detailCauses.push("").concat(accidents);

  var Names = ["X", "Y", "Z", "", "C", "B", "A", ""];

  let respondents = 95, //Total number of respondents (i.e. the number that makes up the total group)
    emptyPerc = 0.4, //What % of the circle should become empty
    emptyStroke = Math.round(respondents * emptyPerc);
  var matrix = [
    [0, 0, 0, 0, 10, 5, 15, 0], //X
    [0, 0, 0, 0, 5, 15, 20, 0], //Y
    [0, 0, 0, 0, 15, 5, 5, 0], //Z
    [0, 0, 0, 0, 0, 0, 0, emptyStroke], //Dummy stroke
    [10, 5, 15, 0, 0, 0, 0, 0], //C
    [5, 15, 5, 0, 0, 0, 0, 0], //B
    [15, 20, 5, 0, 0, 0, 0, 0], //A
    [0, 0, 0, emptyStroke, 0, 0, 0, 0] //Dummy stroke
  ];
  //Calculate how far the Chord Diagram needs to be rotated clockwise to make the dummy
  //invisible chord center vertically
  var offset = (2 * Math.PI) * (emptyStroke / (respondents + emptyStroke)) / 4;

  return {
    names: Names,
    matrix: matrix,
    offset: offset,
  }
}

// https://stackoverflow.com/a/53107778
const getPairs = array => (
  array.reduce((acc, val, i1) => [
    ...acc,
    ...new Array(array.length - 1 - i1).fill(0)
      .map((v, i2) => ([array[i1], array[i1 + 1 + i2]]))
  ], [])
)

function getJsonArrayIndex(JsonArray, searchKey, value) {
  let index = JsonArray.findIndex(function (item, k) {
    return item[searchKey] === value;
  });
  return index;
}

function pushNodeNeighbor(cause, causeNeighbor) {

  let index = getJsonArrayIndex(nodeNeighbor, "cause", cause);

  if (index === -1) {
    nodeNeighbor.push({
      "cause": cause,
      "neighbor": {},
    })
    let causeIndex = getJsonArrayIndex(nodeNeighbor, "cause", cause);
    let array = causeNeighbor.split();
    nodeNeighbor[causeIndex]["neighbor"] = array;


  } else if (!nodeNeighbor[index].neighbor.includes(causeNeighbor)) {
    nodeNeighbor[index].neighbor.push(causeNeighbor);
  }

}

function isOutside(node) {

  let position = {
    "horizontal": null,
    "vertical": null,
  };
  let boolean = false;

  let nodeCoords;
  try {
    if (status.screen = "cause") {
      nodeCoords = getCoords('[title="' + node.__proto__.id + '"]');
    } else {
      nodeCoords = getCoords('[name="' + node.__proto__.id + '"]');
    }
    let svgCoords = getCoords("svg");

    if (nodeCoords.x > svgCoords.x + svgCoords.width) {
      boolean = true;
      position.horizontal = "right";
    } else if (nodeCoords.x < svgCoords.x) {
      boolean = true;
      position.horizontal = "left";
    }
    if (nodeCoords.y > svgCoords.y + svgCoords.height) {
      boolean = true;
      position.vertical = "bottom";
    } else if (nodeCoords.y < svgCoords.y) {
      boolean = true;
      position.vertical = "top";
    }
    
  } catch {

    console.log("isOutside error");
    console.log(document.querySelector('[name="' + node.__proto__.id + '"]').getBoundingClientRect());

  }

  return {
    "boolean": boolean,
    "position": position,
  };
  
}

// https://stackoverflow.com/a/28191966
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

// Adpat from https://stackoverflow.com/a/18561829
function getCoords(query) {

  let element = document.querySelector(query);
  let coord = element.getBoundingClientRect();
  return coord;

};

// https://stackoverflow.com/a/5306832
function array_move(arr, old_index, new_index) {
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr; // for testing
};

function getCauseType(detailCause) {
  let type;
  let naturalCauses = [
    "Water",
    "SwiftWater",
    "Swiftwater",
    "Swift water",
    "Fash Flood",
    "Flash flood",
    "High water flow",
    "Weather",
    "Rockfall",
    "Rock fall",
    "Darkness",
    "Excessive and slippery mud",
    "Exhaustion",
    "Hydraulic",
    "Hypothermia",
  ]
  if (detailCause === "Unknown" || detailCause === "unknown") {
    type = "Unknown";
  } else {
    type = (naturalCauses.includes(detailCause))?"Natural environment": "Human error" ; 
  }
  return type
}