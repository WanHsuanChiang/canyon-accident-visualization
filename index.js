// Adapted from https://bl.ocks.org/heybignick/3faf257bbbbc7743bb72310d03b86ee8
// https://bl.ocks.org/steveharoz/8c3e2524079a8c440df60c1ab72b5d03
// https://bl.ocks.org/denisemauldin/cdd667cbaf7b45d600a634c8ae32fae5
// highlight nodes: https://stackoverflow.com/questions/14600967/d3-force-directed-graph-node-filtering

// variables
const dataUrl = "data/accident.csv";
const analysisDataUrl = "data/accident-analysis.csv";
const width = window.innerWidth;
const height = window.innerHeight;
const svg = d3.select("svg");
const isDebug = false;
let ctx = {

  GRPAH: null,//cause,detail
  INJURY: null,
};

let status = {
  screen: null,
  isDragging: false,
  isHover: false,
  isTooltip: false,
  isTooltipHover: false,
  canyonRating: "FR", //"FR","ACA"
}

let filter = {
  canyonRating: "FR", //"FR","ACA"
}
//let injuryList = [];
let nodeNeighbor = [];
let analysisData;

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

const injuryList = [
  { name: "Others", value: 0 },
  { name: "No Injury or Near Miss", value: 1 },
  { name: "Psychological", value: 2 },
  { name: "Dislocation", value: 3 },
  { name: "Bruise", value: 4 },
  { name: "Concussion or Head Trauma", value: 5 },
  { name: "Abrasion or Laceration", value: 6 },
  { name: "Sprain or Strain", value: 7 },
  { name: "Fracture", value: 8 },
  { name: "Amputation", value: 9 },
  { name: "Hypothermia", value: 10 },
  { name: "Fatality", value: 11 },
]

const injuryColor = function (value) {
  let rating;
  if (value === parseInt(value, 10)) {
    // if input is an integer
    rating = value;
  } else {
    // if input is injuty type string
    rating = injuryRating[value];
  }

  if (rating == 0) {
    return "#cccccc";
  } else {
    //const colorScheme = d3.scaleOrdinal(d3.schemeReds[Object.keys[injuryRating]-1]);
    let length = Object.keys(injuryRating).length - 1;
    //var blues = d3.scaleOrdinal(d3.schemeBlues[9]);
    //let sequential = d3.scaleSequential("red").interpolator(d3.interpolateSpectral).domain([1, Object.keys[injuryRating]-1]); 
    return d3.interpolateReds(rating / length);;
  }
}

//var color = d3.scaleOrdinal(d3.schemeCategory20);


// setup


// https://stackoverflow.com/a/54466624

d3.csv(dataUrl).then(function (accidentData) {

  let filteredData;
  let detailedData;
  drawSidebar();
  draw(accidentData);

  d3.select("#filter-icon").on("click", showFilter());

    /*

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

  //drawFilter(injuryList);

});

function drawSidebar() {

  const sidebar = d3.select("#sidebar")
  const sidebarBBox = getCoords("#sidebar");

  const list = injuryList.sort(function (a, b) { return -a.value - -b.value });

  const item = d3.select("#legend-injury-type .list").selectAll("div")
    .data(list)
    .enter().append("div")
    .attr("name", function (d) { return d.name })
    .attr("class", "item")

  item.append("div").style("background-color", function (d) { return injuryColor(d.name) })
  item.append("div").html(function (d) { return d.name })

}


// draw main network diagram
// https://bl.ocks.org/heybignick/3faf257bbbbc7743bb72310d03b86ee8
function draw(data) {

  svg.attr("id", "main-chart");

  let networkSet = getNetworkData(data);
  let network = networkSet.network;

  const radiusScale = d3.scaleSqrt().domain([1, networkSet.maxValue]).range([height / 32, height / 8]);

  ctx.GRPAH = "cause";
  status.screen = "cause";

  d3.selectAll("line").exit();
  d3.select(".nodes").selectAll("g").exit();
  svg.selectAll("*").remove();


  svg.attr("viewBox", [-width / 2, -height / 2, width, height]);

  changeLegend();


  const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id))
    .force("charge", d3.forceManyBody().strength(-400))
    .force("center", d3.forceCenter(width / 20, 0))
    .force("collide", d3.forceCollide().strength(0.5).radius(function (d) { return radiusScale(d.value) * 1.5; })) // radius
    //.force("collide", d3.forceCollide().strength(0.5).radius(80)) // radius
    //.force("x", d3.forceX().x(d => d.x))
    .force("x", d3.forceX(width / 2))
    .force("y", d3.forceY(height / 2).strength(0.3));
  const links = network.links.map(d => Object.create(d));
  const nodes = network.nodes.map(d => Object.create(d));
  //const links = data.links;
  //const nodes = data.nodes; 

  // link
  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("g").append("line")
    .attr("class", "link")
    .attr("source", function (d) { return d.source })
    .attr("target", function (d) { return d.target })
    .attr("stroke-width", function (d) { return Math.sqrt(d.value) * 3; });


  let node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .enter().append("g")
    .attr("title", function (d) { return d.id; })
    .attr("class", "node cause")
    .attr("type", function (d) {
      let cause = d.id;
      let type = (causeType[cause] === undefined) ? "Uncategorized" : causeType[cause];
      return type;
    });



  let circles = node.append("circle")
    .attr("r", function (d) { return radiusScale(d.value) })


  let labels = node.append("text").text(function (d) { return d.id })
    .attr("text-anchor", "middle")
    .attr("class", "cause-label")
    .attr('x', 0)
    .attr('y', function (d) { return radiusScale(d.value) / 16 })
    .style("font-size", function (d) { return radiusScale(d.value) / 4 + "px" });


  let modify = [
    "Inadequate equipment",
    "Navigation error",
    "Communication error",
    "Equipment misuse",
    "Group dynamics",
    "Solo canyoneering"
  ]
  let modifyValue = [
    10,
    5,
    5,
    5,
    6,
    4,
  ]
  for (i = 0; i < modify.length; i++) {
    let ie = d3.select('.node[title="' + modify[i] + '"] text');
    ie.text("");
    ie.append("tspan").attr("text-anchor", "middle").attr("x", 0).attr("y", -modifyValue[i] / 2).text(modify[i].split(" ")[0]);
    ie.append("tspan").attr("text-anchor", "middle").attr("x", 0).attr("y", modifyValue[i] * 1.5).text(modify[i].split(" ")[1]);
  }







  /*
    for(i = 0; i < network.nodes.length; i++){
      if (d3.select('[title="'+ network.nodes[i].id +'"] circle').attr("r") > network.nodes[i].cause.length* (radiusScale(network.nodes[i].value) / 2)){
        for (j = 0; j < network.nodes[i].causeArray.length; j++){
          d3.select('[title="'+network.nodes[i].id+'"] text').append("tspan").text(function(d){return network.nodes[i].causeArray[j]})      
        }
      } else {
        d3.select('[title="'+network.nodes[i].id+'"] text').text(function(d){return d.id})
      }        
    }
    */

  //d3.selectAll(".node tspan")

  //if (j = network.nodes[i].causeArray.length){
  //  tspan.attr("dy", "1.2em").attr("dx", 0);
  //}     

  node.attr("drag", false)
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))
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
    d3.select(this).attr("drag", true);
    status.isDragging = true;
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = event.x;
    d.fy = event.y;
    d3.select('.tooltip').attr("highlighted", false);
    // not highlight sidebar
    d3.select("#sidebar")
      .attr("highlighted", false)
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    d3.select(this).attr("drag", false);
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
    // highlight sidebar
    d3.select("#sidebar")
      .attr("highlighted", null)
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
        let causeNeighbors = nodeNeighbor[index].neighbor; //json, with name and value
        for (i = 0; i < causeNeighbors.length; i++) {
          d3.select('[title="' + causeNeighbors[i]["name"] + '"]').attr("highlighted", true);
        }
      }
      // highlight links
      d3.selectAll(".link").attr("highlighted", false);
      d3.selectAll('[source="' + cause + '"]').attr("highlighted", true);
      d3.selectAll('[target="' + cause + '"]').attr("highlighted", true);

      // not highlight sidebar
      d3.select("#sidebar")
        .attr("highlighted", false)


      try {
        drawTooltip(network.nodes[d.index], data, nodeNeighbor[index].neighbor);
      } catch {
        drawTooltip(network.nodes[d.index], data, null);
      }



    }


  }
  function mouseleave(event, d) {
    if (!status.isDragging) {
      status.isHover = false;
      d3.selectAll(".node").attr("highlighted", null);
      d3.selectAll(".link").attr("highlighted", null);
      if (!isDebug) { d3.select('.tooltip').remove() };
      status.isTooltip = false;

      // highlight sidebar
      d3.select("#sidebar")
        .attr("highlighted", null)
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


const drawDetail = (data, cause) => {

  status.isHover = false;
  status.isTooltip = false;
  d3.selectAll(".tooltip").remove();
  svg.attr("id", "detail-chart");

  let detailStatus = {
    isNodeHover: false,
    isTooltipHover: false,
    isTooltip: false,
    isDragging: false,
    currentNode: null,
    currentTooltip: null,
  }

  let networkSet = getAccidentNetworkData(data, cause);
  let network = networkSet.network;

  const links = network.links.map(d => Object.create(d));
  const nodes = network.nodes.map(d => Object.create(d));
  const radius = height/64;
  const forceCenter = { x: width / 2, y: height / 4 };

  // determine layout
  const isHorizontal = (networkSet.causeNum >= 20 || networkSet.accidentNum >= 20) ? true : false;
  function isAccident(d) {
    if (d.category === "accident") { return true; }
    else { false }
  }
  const center = (isHorizontal) ? { x: 0, y: 0 } : { x: 0, y: 50 };
  const injuryLength = Object.keys(injuryRating).length;
  const injuryScale = d3.scaleLinear().domain([1, injuryLength]).range([-width / 4, width / 4]);


  changeLegend(cause, isHorizontal);


  // detail with center
  d3.select(".nodes").attr("class", "center");
  transformCenter();
  function transformCenter() {
    const centerNode = d3.select(".center .node");
    const centerBBox = getCoords(".center .node");
    const svgBBbox = svg.node().getBBox();
    const adjustCenter = {// from relative coords to absolute coords
      x: svgBBbox.x + (svgBBbox.width / 2) + center.x,
      y: center.y + (svgBBbox.height / 2) + svgBBbox.y,
    };
    if (isHorizontal) {
      const sidebarBBox = getCoords("#sidebar");
      console.log(sidebarBBox)
      const translate = {
        //x: adjustCenter.x - (sidebarBBox.x + sidebarBBox.width),
        x: -width / 2 + sidebarBBox.width + centerBBox.width / 2,
        y: -height / 2 + centerBBox.height / 2 - centerBBox.height / 6,
      }
      centerNode.transition().duration(2000).attr("transform", "translate(" + translate.x + "," + translate.y + ")")

    } else {

      const translate = {
        dx: adjustCenter.x - centerBBox.x,
        dy: adjustCenter.y - centerBBox.y,
      }
      centerNode.transition().duration(300).attr("transform", "translate(" + translate.x + "," + translate.y + ")")
      centerNode.transition().duration(800).attr("transform", "translate(0,-50)")
    }
  }


  /*
  let centerNode = d3.select('[title = "' + cause + '"]').attr("class", d3.select('[title = "' + cause + '"]').attr("class") + " center-node")
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));;
  svg.selectAll('*').remove();
  */
  /*
    const position = getCoords(".center");
    const transform = () => {
  
      dy = -(position.cy + position.height);
      return "translate(0," + dy + ")scale(3)"
    }
    centerNode.transition().duration(1500).attr("transform", transform)
    d3.select(".center text").remove();
  */


  /*
    // draw the title
    sleep(1500).then(() => {
      // Do something after the sleep!
      svg.append("g").attr("class", "title").append("text").attr("text-anchor", "middle").text("Accidents associated with " + cause)
        .attr("x", 0)
        .attr("y", -height / 2)
        .transition().duration(1500).attr("transform", "translate(0," + height / 10 + ")");
    });
  */

  //let link = svg.insert("g", "g.nodes")
  let link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("class", function (d) { return (d.target == cause) ? "link dummy" : "link" })
    .attr("source", function (d) { return d.source })
    .attr("target", function (d) { return d.target })
    .attr("stroke-width", 4);

  // node
  let node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .enter().append("g")
    .attr("category", function (d) { return d.category })
    .attr("name", function (d) { return d.id })
    .attr("class", function (d) { return (d.id === "dummy") ? "node dummy" : "node"; });

  d3.selectAll('[category="accident"]').attr("injury-max", function (d) { return d.injuryMax });
  d3.selectAll('[category="cause"]').attr("type", function (d) { return getCauseType(d.id) });

  // circle
  const radiusScale = d3.scaleSqrt().domain([1, networkSet.accidentMax]).range([radius, radius * 2]);
  let circles = node.append("circle")
    .attr("r", function (d) {
      if (d.id === "dummy") { return 1 }
      else if (!isAccident(d)) { return radiusScale(d.value) }
      else { return radius }
    })
    .on("mouseenter", mouseenter)
    .on("mouseleave", mouseleave)
    .attr("drag", false)
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  d3.selectAll('[category="accident"] circle').style("fill", function (d) { return injuryColor(d.injuryMax) });

  // label
  let labels = node.append("text").attr("class", "label")

  d3.selectAll('[category="cause"] text').text(function (d) { return d.id; });
  d3.selectAll('[category="accident"] text').style("fill", function (d) { return injuryColor(d.injuryMax) })
  d3.selectAll('[category="accident"] text').append("tspan").text(function (d) { return d.canyon });
  d3.selectAll('[category="accident"] text').append("tspan").text(function (d) { return d.date }).attr("dy", "1.2em").attr("x", "2em");

  labels
    .attr("text-anchor", function (d) { return getLabelPosition(d).textAnchor })
    .attr('y', function (d) { return getLabelPosition(d).y })
    .attr('x', function (d) { return getLabelPosition(d).x })
    .attr("transform", function (d) { return getLabelPosition(d).transform })
  function getLabelPosition(d) {
    let textAnchor;
    let x;
    let y;
    let transform;
    if (isHorizontal) {
      // for horizontal layout
      if (isAccident(d)) {
        // if node is accident
        textAnchor = "start";
        x = 10;
        y = -radius * 2;
        transform = "rotate(-45 0,0)";
      } else {
        // if node is cause
        textAnchor = "end";
        x = -10;
        y = radius * 2;
        transform = "rotate(-45 0,0)";
      }
    } else {
      // for radial layout
      if (injuryScale(injuryScale(d.injuryValue)) > 0) {
        textAnchor = "start"
        x = (isAccident(d)) ? radius : radiusScale(d.value);
        y = 0;
        transform = null;
      } else {
        textAnchor = "end"
        x = (isAccident(d)) ? -radius : -radiusScale(d.value);
        y = 0;
        transform = null;
      }

    }
    return {
      textAnchor: textAnchor,
      x: x,
      y: y,
      transform: transform,
    }
  }

  // force simulation
  let simulation;
  if (isHorizontal) {
    // horizontal layout force simulation
    simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(d => d.id).strength(0))
      .force("charge", d3.forceManyBody().strength(-600))
      //.force("center", d3.forceCenter(0, 0))
      .force("collide", d3.forceCollide().strength(1).radius(function (d) { return (d.id === "dummy") ? 1 : 20 }))
      //.force("r", d3.forceRadial(0, 0, -100).strength(0))
      .force("x", d3.forceX(function (d) {
        if (isAccident(d)) { return injuryScale(d.injuryValue) }
        else { return injuryScale(d.injuryValue) }
      }).strength(0.3))
      .force("y", d3.forceY(function (d) { return (isAccident(d)) ? -100 : height / 4; }).strength(4))

  } else {
    // radial layout force simulation
    simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(d => d.id).strength(0))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(center.x, center.y))
      .force("collide", d3.forceCollide().strength(1).radius(function (d) { return (d.id === "dummy") ? 1 : 20 }))
      .force("r", d3.forceRadial(function (d) {
        let val;
        if (d.id === cause) { val = 0; }
        else { val = (isAccident(d)) ? 100 : 250 }
        return val;
      }, center.x, -center.y).strength(3))
      //.force("x", d3.forceX())
      .force("x", d3.forceX(function (d) {
        if (isAccident(d)) { return injuryScale(d.injuryValue) }
        else { return injuryScale(d.injuryValue) }
      }))
      .force("y", d3.forceY(function (d) {
        return (isAccident(d)) ? 500 : 300;
      }));
  }

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


    if (isHorizontal) {
      node
        .attr("transform", function (d) {
          //console.log(d.injuryValue)
          return "translate(" + d.x + "," + d.y + ")";
          //return "translate(" + injuryScale(d.injuryValue)+ "," + 100 + ")";
        });
    } else {
      node
        .attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        });

    }

    /*
   
         node.attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
         .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });
    
         node
         .attr("transform", function (d) {
           
           let dx = (d.x < 0 )? Math.min(radius*2, Math.min(width, d.x)): Math.max(radius*2, Math.min(width, d.x));
           let dy = (d.y < 0 )? Math.min(radius*2, Math.min(height, d.y)): Math.max(radius*2, Math.min(height, d.y));
           console.log({dx: dx, "d.x": d.x, radius: radius,svgPositionX : svgPosition.x, svgPositionWidth: svgPosition.width , width: width});
           return "translate(" + dx + "," + dy + ")";
         });
  */



  };
  // drag and drop 
  function dragstarted(event, d) {
    d3.select(this).attr("drag", true);
    detailStatus.isDragging = true;
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = event.x;
    d.fy = event.y;
    if (detailStatus.isTooltip) { d3.select(".tooltip").attr("highlighted", false); }
    // not highlight sidebar
    d3.select("#sidebar")
      .attr("highlighted", false)


  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    detailStatus.isDragging = false;
    d3.select(this).attr("drag", false);
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    d3.selectAll(".node").attr("highlighted", null);
    d3.selectAll(".link").attr("highlighted", null);
    if (detailStatus.isTooltip) { d3.select(".tooltip").remove(); }
    // highlight sidebar
    d3.select("#sidebar")
      .attr("highlighted", null)

  }



  const sleepTime = 1000;

  // sleep time expects milliseconds
  function sleep(time) {
    //if(detailStatus.isTooltipHover){return}
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  // mouseenter and mouseout
  function mouseenter(event, d) {

    if (!detailStatus.isDragging && !detailStatus.isTooltipHover) {

      detailStatus.currentNode = d.id;

      //d3.selectAll(".tooltip").remove();

      detailStatus.isHover = true;

      highlight(network.nodes[d.index], data);

      if (d.category === "accident") {

        drawAccidentTooltip(network.nodes[d.index]);

      }

      if (isHorizontal) {
        d3.select("#controller").style("opacity", 0.1)
      }

    }


  }
  function mouseleave(event, d) {

    if (!detailStatus.isDragging && !detailStatus.isTooltipHover) {

      detailStatus.currentNode = null;

      // highlight sidebar
      d3.select("#sidebar")
        .attr("highlighted", null)

      d3.selectAll(".node").attr("highlighted", null);
      d3.selectAll(".link").attr("highlighted", null);

      d3.select('.tooltip[name="' + d.id + '"]').style("transition", 'opacity ' + sleepTime + 'ms');
      d3.select('.tooltip[name="' + d.id + '"]').style("opacity", "0")

      if (isHorizontal) {
        d3.select("#controller").style("opacity", 0.5)
      }

      if (!isDebug) {
        sleep(sleepTime).then(() => {
          // Do something after the sleep!

          if (!detailStatus.isTooltipHover && detailStatus.currentNode !== d.id && detailStatus.currentNode === null) {

            d3.select('.tooltip[name="' + d.id + '"]').remove();
            detailStatus.isTooltip = false;

          }

        });


      }

    }

  }


  const drawAccidentTooltip = (nodeData) => {

    console.log(nodeData)

    const isDraw = () => {
      if (
        status.screen === "detail"
        && nodeData.category === "accident"
        && detailStatus.isNodeHover
        && !detailStatus.isTooltipHover
        && !detailStatus.isTooltip
        && currentNode !== currentTooltip
      ) { return true }
      else { return false };
    }

    if (isDraw) {

      d3.selectAll('.tooltip').remove();

      //console.log("Start draw tooltip");

      detailStatus.isTooltip = true;
      detailStatus.currentTooltip = nodeData.id;


      let indvInjuries = [];
      for (i = 0; i < nodeData.injury.length; i++) {
        indvInjuries.push({
          name: nodeData.injury[i],
          value: injuryRating[nodeData.injury[i]],
        })
      };
      indvInjuries.sort(function (a, b) { return +a.value - +b.value });


      let tooltip = d3.select("body").append("div")
        .attr("class", "tooltip accident-tooltip")
        .attr("injury-max", nodeData.injuryMax)
        .attr("name", nodeData.id);

      let tooltipTitle = tooltip.append("div").attr("class", "tooltip-title");

      if (nodeData.canyon.includes(",")){
        tooltipTitle.append("h4").html(nodeData.canyon.split(",").join(", ") + ' (' + nodeData.date + ')');
      }else {
        tooltipTitle.append("h4").html(nodeData.canyon + ' (' + nodeData.date + ')');
      }
      


      // cuase list
      /*
     let ul = tooltip.append("div").attr("class","cause-list")     
     .append("ul").selectAll("li")
     .data(nodeData.detailCause)
     .enter().append("li")
     .attr("type", function(d){return getCauseType(d) })
     .html(function(d){return d})
    */


      drawCause();
      function drawCauseList() {

        const radius = 4;
        const offset = 12;
        const list = nodeData.detailCause;

        let causeSvg = tooltip.append("div")
          .attr("class", "cause-chart")
          .style("height", "40px")
          .append("svg")
          .attr("viewBox", "0 0 200 40");


        for (i = 0; i < list.length; i++) {

          let causeBullet = causeSvg.append("g").attr("class", "cause-item")
            .attr("name", list[i])
            .attr("type", function () { return getCauseType(list[i]) });

          let circle = causeBullet.append("circle").attr("r", radius)
          //let text = causeBullet.append("text").text(list[i])

          const svgBBox = causeSvg.node().getBBox();
          const circleBBox = circle.node().getBBox();
          //const textBBox = text.node().getBBox();

          const circleXY = getXY();
          function getXY() {
            let x = svgBBox.x;
            let y = Math.abs(svgBBox.y - circleBBox.y);

            return { x: x, y: 100 }
          }



          circle.attr("x", 50).attr("y", 100)
          //text.attr("x", circleXY.x).attr("y",circleXY.y)


        }
        /*
        let causeBullet = causeSvg.selectAll("g").attr("class", "cause-item")
          .data(nodeData.detailCause)
          .enter().append("g")

          .attr("name", function (d) { return d })
          .attr("type", function (d) { return getCauseType(d) });

        let circle = causeBullet.append("circle").attr("r", radius)

        let text = causeBullet.append("text").text(function(d){return d})

        const svgBBox = causeSvg.node().getBBox();

        let cx = 
        
        */

      }

      function drawCause() {
        const radius = 4;
        const list = nodeData.detailCause;

        let causeDiv = tooltip.append("div").attr("class", "cause-chart");

        for (i = 0; i < list.length; i++) {
          //let causeItem = causeDiv.append("div").append("ul");
          //let causeSvg = causeItem.append("svg").attr("viewBox", "0 0 200 40");
          let text = causeDiv.append("div").attr("type", getCauseType(list[i])).html(list[i])

          //causeSvg.append("circle").attr("r", radius);
        }
      }


      // Draw Injury Chart
      drawInjuryChart();
      function drawInjuryChart() {
        const space = 2;
        let injurySvg = tooltip.append("div")
          .attr("class", "injury-chart")
          .style("height", function () { return (indvInjuries.length > 1) ? "100px" : "60px" })
          .append("svg")
          .attr("viewBox", function () { return (indvInjuries.length > 1) ? "0 0 200 50" : "0 0 200 30" });
        //.attr("preserveAspectRatio", "xMidYMid meet");




        let injuryBar = injurySvg.selectAll("g").attr("class", "injury-bars")
          .data(injuryList)
          .enter().append("g")
          .attr("fill", function (d) { return injuryColor(d.name) })
          .attr("name", function (d) { return d.name })
          .attr("value", function (d) { return d.value })
          .attr("title", (d)=> d.name)

        injuryBar.append("rect")
          .attr("width", (1 / injuryList.length * 100) + "%")
          .attr("height", "5px")
          .attr("y", function () { return (indvInjuries.length > 1) ? 20 : 10; })
          .attr("x", function (d) { return (d.value / injuryList.length) * 100 + "%" })

        const chartBBox = injurySvg.node().getBBox();

        for (i = 0; i < indvInjuries.length; i++) {

          let bar = d3.select('.injury-chart [name="' + indvInjuries[i].name + '"]');// find the injury rectangle
          let bbox = bar.node().getBBox();// find the rect position
          let text;
          let textBBox;
          let textX = bbox.x + bbox.width / 2;
          let textY;
          let triangle;

          if (i & 1) {
            // if i is odd

            // draw text first
            text = bar.insert("text");
            text.text(indvInjuries[i].name).attr("text-anchor", "middle")
            textBBox = text.node().getBBox(); // only want to know width & height
            // then draw triangle
            triangle = bar.insert("path", '[name="' + indvInjuries[i].name + '"] rect').attr("d", path(bbox, "top"));
            let pathBBox = triangle.node().getBBox();
            textY = pathBBox.y - textBBox.height - space + 6;

          } else {
            // if i is even

            // draw triangle first
            triangle = bar.append("path").attr("d", path(bbox, "bottom"));
            let pathBBox = triangle.node().getBBox();
            // then draw text
            text = bar.append("text")
            text.text(indvInjuries[i].name).attr("text-anchor", "middle")
            textBBox = text.node().getBBox(); // only want to know width & height
            textY = pathBBox.y + pathBBox.height + space + 6;
            /*
  
  
            prevText = { x: textX, width: bbox.width };
            
            if (i > 0) {
  
              let prevText = d3.select('.injury-chart [name="' + indvInjuries[i - 1].name + '"]').node().getBBox();
              if (prevText.x + prevText.width > textX) {
                textY = textY + textBBox.height;
              }
  
            }
            */

          }


          if (textX + textBBox.width > chartBBox.width) {
            textX = chartBBox.width - textBBox.width / 2
          } else if (textX < 0) {
            textX = textBBox.width / 2 + 10;
          }
          text.attr("x", textX).attr("y", textY)

        }


        // draw equilateral triangle
        function path(bbox, position) {

          const length = 4;
          //const barCoords = getCoords('.injury-chart [name="'+ injury +'"] rect');          
          const start = {
            x: bbox.x + bbox.width / 2,
            y: (position === "bottom") ? bbox.y + bbox.height + space : bbox.y - space,
          }
          const left = {
            x: start.x - length / 2,
            y: (position === "bottom") ? start.y + Math.sqrt(3) * (length / 2) : start.y - Math.sqrt(3) * (length / 2)
          }
          const right = {
            x: start.x + length / 2,
            y: left.y,
          }

          return "M" + start.x + " " + start.y + " L" + left.x + " " + left.y + " L" + right.x + " " + right.y + "Z";
        }


      }


      let tooltipList = tooltip.append("div").attr("class", "tooltip-list");
      // canyon
      tooltipList.append("div").attr("class", "canyon");
      d3.select(".canyon").append("div").html("Canyon");
      let locationString = d3.select(".canyon").append("div");
      if(nodeData.canyon.includes(",")){
        locationString.html('<a href="' + nodeData.canyonUrl.split(",")[0] + '" target="_blank">' + nodeData.canyon.split(",")[0] + '</a>, <a href="' + nodeData.canyonUrl.split(",")[1] + '" target="_blank">' + nodeData.canyon.split(",")[1] + '</a>')
      } else if (nodeData.canyonUrl.includes("http")) {
        locationString.html('<a href="' + nodeData.canyonUrl + '" target="_blank">' + nodeData.canyon + '</a>')        
      } else {
        locationString.html(nodeData.canyon);
      }
      // region
      tooltipList.append("div").attr("class", "region");
      d3.select(".region").append("div").html("Region");
      d3.select(".region").append("div").html(nodeData.area + ', ' + nodeData.country);
      // canyon rating
      tooltipList.append("div").attr("class", "rating");
      d3.select(".rating").append("div").html("Canyon Rating");
      let ratingContent = d3.select(".rating").append("div").attr("title", "Switch to ACA Canyon Rating System.").attr("class","switch");
      let ratingString = ratingContent.append("div").html((status.canyonRating === "FR") ? nodeData.canyonRatingFR : nodeData.canyonRatingACA);

      if (nodeData.canyonRatingFR !== "Unknown"){
        let icon = ratingContent.append("div").attr("class","icon")
        icon.append("img").attr("src", "source/switch.svg"); 
        ratingContent.on("click",function(){
          if(status.canyonRating === "FR"){
            ratingString.html(nodeData.canyonRatingACA );
            ratingContent.attr("title","Switch to French Canyon Rating System.");
            status.canyonRating = "ACA";
          } else {
            ratingString.html(nodeData.canyonRatingFR);
            ratingContent.attr("title","Switch to ACA Canyon Rating System.");
            status.canyonRating = "FR";
          }
        })
      }     
 


      /*
      // cause
      tooltipList.append("div").attr("class", "cause");
      d3.select(".tooltip .cause").append("div").html("Causes");
      d3.select(".tooltip .cause").append("div").html(nodeData.detailCause.join(", "));     
      // injury
      tooltipList.append("div").attr("class", "injury");
      d3.select(".tooltip .injury").append("div").html("Injury");
      d3.select(".tooltip .injury").append("div").html(nodeData.injury.join(", "));
      */
      // accident analysis    

      // load analysis data for the first place
      if (analysisData === undefined || analysisData === null) {
        d3.csv(analysisDataUrl).then(function (data) {
          analysisData = data.filter(function (d) { return d.id !== "" });
        });
      }

      try {
        let filteredAnalysisData = analysisData.filter(function (d) {
          return d.id === nodeData.id;
        });

        let analysisContent = "";
        if (filteredAnalysisData.length === 1) {
          analysisContent = filteredAnalysisData[0].analysis;
        } else if (!getJsonArrayIndex(filteredAnalysisData, "type", "Main") === -1) {
          analysisContent = filteredAnalysisData[getJsonArrayIndex(filteredAnalysisData, "analysisType", "Main")].analysis;
        } else if (!getJsonArrayIndex(filteredAnalysisData, "type", "Rescue") === -1) {
          analysisContent = filteredAnalysisData[getJsonArrayIndex(filteredAnalysisData, "analysisType", "Rescue")].analysis;
        } else { //ICAD analysis
          analysisContent = filteredAnalysisData[getJsonArrayIndex(filteredAnalysisData, "analysisType", "ICAD")].analysis;
        }

        if (analysisContent !== "") {
          tooltip.append("hr");
          tooltip.append("span").attr("class", "tooltip-subtitle").html("Analysis");
          tooltip.append("div").attr("class", "tooltip-analysis").html(analysisContent);
        }

      } catch {
        console.log("no accident analysis");
      }

      // view more button
      let btn = tooltip.append("div").attr("class", "view-more")
      btn.append("a").attr("href", nodeData.accidentUrl).attr("target", "_blank").html("View More");
      btn.style("background-color", injuryColor(nodeData.injuryMax))
      if (injuryRating[nodeData.injuryMax] > injuryList.length / 2) {
        btn.attr("class", btn.attr("class") + " bg-dark")
      } else {
        btn.attr("class", btn.attr("class") + " bg-light")
      }



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


      // tooltip event
      tooltip
        .on("mouseenter", function () {

          detailStatus.isTooltipHover = true;
          detailStatus.isNodeHover = false;
          d3.select(this).attr("highlighted", true);
          d3.select(this).style("opacity", null);
          highlight(nodeData, data);

        })
        .on("mouseleave", function () {
          detailStatus.isTooltipHover = false;
          if (!isDebug) { d3.select(this).remove(); }
          detailStatus.isTooltip = false;
          removeHighlight();
        })




    }

  }


}


const highlight = (nodeData, data) => {

  const targetNode = d3.select('.node[name="' + nodeData.id + '"]');


  // highlight nodes
  d3.selectAll(".node").attr("highlighted", false);
  targetNode.attr("highlighted", true);
  d3.select(".center .node").attr("highlighted", true);

  if (nodeData.category === "accident") {
    // of is accident node, highlight cause
    let index = getJsonArrayIndex(data, "id", nodeData.id); // find accident data from dataset
    for (i = 0; i < data[index].detailCause.split(",").length; i++) {
      d3.select('[name="' + data[index].detailCause.split(",")[i] + '"]').attr("highlighted", true);
    }
  } else {
    // if is cause node, highlight accident
    for (i = 0; i < nodeData.accidents.length; i++) {
      d3.select('[name="' + nodeData.accidents[i] + '"]').attr("highlighted", true);
    }
  }

  // highlight links
  d3.selectAll(".link").attr("highlighted", false);
  d3.selectAll('[source="' + nodeData.id + '"]').attr("highlighted", true);
  d3.selectAll('[target="' + nodeData.id + '"]').attr("highlighted", true);

  // not highlight sidebar
  d3.select("#sidebar")
    .attr("highlighted", false)

}

const removeHighlight = () => {
  d3.selectAll('.node').attr('highlighted', null);
  d3.selectAll('.link').attr('highlighted', null);

  // highlight sidebar
  d3.select("#sidebar")
    .attr("highlighted", null)
}

const drawFilter = (array) => {
  let select = d3.select("#injury-option");
  for (i = 0; i < array.length; i++) {
    select.append("option").attr("value", array[i]).html(array[i]);
  }
}

const drawTooltip = (nodeData, data, nodeNeighbor) => {

  if (status.isHover && status.screen === "cause") {

    status.isTooltip = true;

    let tooltip = d3.select("body").append("div")
      .attr("class", "tooltip main-cause-tooltip")
      .attr("cause", nodeData.id)
      .attr("type", (causeType[nodeData.id] === undefined) ? "Uncategorized" : causeType[nodeData.id]);



    let tooltipTitle = tooltip.append("div").attr("class", "tooltip-title");
    tooltipTitle.append("h4").html(nodeData.id);
    

    tooltipTitle.append("span").attr("class", "cause-type").html((causeType[nodeData.id] === undefined) ? "Uncategorized" : causeType[nodeData.id])
    /*
    let tooltipList = tooltip.append("div").attr("class", "tooltip-list");
    tooltipList.append("div").attr("class", "accident-number");
    d3.selectAll(".accident-number").append("div").html("Accident Numbers");
    d3.selectAll(".accident-number").append("div").html(nodeData.value);
    */
    //d3.max(barData, d => d.value)
    let injuryData = [];
    drawInjuryChart();
    function drawInjuryChart() {

      const chartHeight = 10;

      // draw injury chart
      // https://codepen.io/nlounds/pen/GzKwt

      /* draw small injury diagram start*/
      // https://observablehq.com/@eesur/d3-single-stacked-bar

      // set up data      

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

      injuryData.sort(function (a, b) { return +a.injuryValue - +b.injuryValue });
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

      let injurySvg = tooltip.append("div").style("height", chartHeight + "px").attr("class", "injury-chart")
        .append("svg")
        .attr("viewBox", "0 0 300 " + chartHeight)
      //.attr("preserveAspectRatio", "xMidYMid meet");
      let injuryBar = injurySvg.selectAll("g")
        .data(injuryData)
        .enter().append("g")
        .attr("injury-max", function (d) { return d.injury });

      let percentSoFar = 0;
      injuryBar.append("rect")
        .attr("height", "10px")
        .attr("width", function (d) { return ((d.value / nodeData.value) * 100) + "%" })
        .attr("y", 0)
        .attr("x", function (d) {
          let prePrecent = percentSoFar;
          let thisPrecent = (d.value / nodeData.value) * 100;
          percentSoFar = percentSoFar + thisPrecent;
          return prePrecent + "%";
        })
        .style("fill", function (d) { return injuryColor(d.injury); });
      /*
      injuryBar.append("text").text(function (d) { return d.injury })
        .attr("y", 8)
        .attr("x", function (d) { return d3.select('[injury-max = "' + d.injury + '"] rect').attr("x") });

      */
      //injuryLabel.style("transform","translate(300,150) rotate(0)");

      /*
      tooltip.append("svg")
      .attr("viewbox", "0 0 50 100")
      //
      .append("g");
      */
    }


    tooltip.append("p").html(function () {
      let max = d3.max(injuryData, d => d.value);
      let num = ((max / nodeData.value) * 100).toFixed(0)
      let array = injuryData.sort(function (a, b) { return -a.injuryValue - -b.injuryValue });
      let injury = array[getJsonArrayIndex(array, "value", max)].injury.toLowerCase();
      return nodeData.value + " accidents occurred because of " + nodeData.id.toLowerCase() + ". " + num + "% of the accidents resulted in " + injury + ".";
    })




    //nodeData.value+ " accidents occurred because of " + nodeData.id.toLowerCase() + ". ");

    if (nodeNeighbor !== null) {
      drawBarChart();
    }
    function drawBarChart() {

      const barData = nodeNeighbor.sort(function (a, b) { return -a.value - -b.value });

      const barH = 16; //px
      const padding = 2; // px
      const margin = ({ top: 5, right: 0, bottom: 15, left: 0 });
      const chartH = barData.length * barH + (barData.length - 1) * padding + margin.top + margin.bottom;
      //const margin = ({top: 30, right: 0, bottom: 10, left: 30});            

      tooltip.append("span").attr("class", "tooltip-subtitle").html("The causes identified in the same accident. (frequency)");
      const barSvg = tooltip.append("div").style("height", chartH + "px").attr("class", "neighor-cause-chart")
        .append("svg").attr("viewBox", "0 0 300 " + chartH);
      //tooltip.append("span").attr("class","tooltip-note").html("Many causes can contribute to a single accident.")   



      // https://observablehq.com/@d3/horizontal-bar-chart          

      const width = d3.scaleLinear()
        .domain([0, d3.max(barData, d => d.value)])
        .range([0, 50])

      let bar = barSvg.append("g")
        .selectAll("g")
        .data(barData)
        .enter().append("g")
        .attr("type", (d) => getCauseType(d.name))
        .attr("name", (d) => d.name)

      bar.append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * (barH + padding) + margin.top)
        .attr("width", d => width(d.value) + "%")
        .attr("height", barH + "px")

      bar.append("text")
        .attr("x", function (d) { return width(d.value) + 2 + "%" })
        .attr("y", (d, i) => i * (barH + padding) + margin.top + barH - 4)
        .text((d) => d.name)

      bar.append("text").attr("class", "number")
        .attr("text-anchor", "end")
        .attr("x", function (d) { return width(d.value) - 1 + "%" })
        .attr("y", (d, i) => i * (barH + padding) + margin.top + barH - 4)
        .text((d) => d.value)

      barSvg.append("text").attr("class", "tooltip-note")
        .attr("x", 0)
        .attr("y", "98%")
        .text("* Many causes can contribute to a single accident.")

    }






    /* determine tooltip position start */
    let nodeCoords = getCoords('[title="' + nodeData.id + '"] circle');
    let svgCoords = getCoords("#main-chart");
    let tooltipCoords = getCoords(".tooltip");

    // determine x
    let tooltipX;
    if (nodeCoords.cx > svgCoords.x + svgCoords.width / 2) { // at right      
      tooltipX = nodeCoords.x - tooltipCoords.width - 20;
    } else { // at left      
      tooltipX = nodeCoords.right + 20;
    }
    // determin y
    tooltipY = nodeCoords.cy - tooltipCoords.height / 2;
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

const changeLegend = (cause, isHorizontal) => {

  const duration = 500;
  const controller = d3.select("#controller");
  let isShow = true;

  d3.select("#legend").transition().duration(duration).style("opacity", null);
  d3.select("h2").transition().duration(duration).style("opacity", null);

  if (status.screen === "detail") {
    //d3.select("h1").transition().duration(500).attr("transform","scale(0.5)")
    d3.select("#sidebar h1").html("Canyon accidents due to " + cause)
    d3.select("#sidebar h2").html("Case studies help canyoneers to avoid accidents in the future.")
    d3.select("#legend-cause-size div:last-child").html("The number of canyon accidents (cause nodes only).");
    d3.select("#legend-correlation").style("display", "none");
    d3.select("#legend-injury-type div:first-child").html("Accidents");
    d3.select("#legend-injury-type .item").style("align-items", "center");
    d3.selectAll("#legend-injury-type .item div:first-child").style("border-radius", "50px").style("width", "12px").style("height", "12px");
    d3.select("#legend-note").html("The accident nodes are color encoded as the severity level of the most serious injury in the correspending accident.");
    if (isHorizontal) {

      const opacity = 0.5;

      // show controller
      controller.style("display", null);
      controller.transition().duration(duration).style("opacity", opacity);
      // hide some of the sidebar
      d3.select("#legend").transition().duration(duration).style("opacity", 0);
      d3.select("h2").transition().duration(duration).style("opacity", 0);
      isShow = false;
      controller.attr("title", "Show Legend");
      controller.on("click", function () {
        if (isShow) {
          // then hide 
          controller.attr("title", "Hide Legend");
          controller.select("img").attr("src", "source/show.svg");
          d3.select("#legend").transition().duration(duration).style("opacity", 0);
          d3.select("#sidebar").transition().duration(duration).style("background-color", null);
          d3.select("#sidebar").style("z-index", null);
          d3.select("h2").transition().duration(duration).style("opacity", 0);
          isShow = false;
        } else {
          // then show
          controller.attr("title", "Show Legend");
          controller.select("img").attr("src", "source/hide.svg");
          d3.select("#legend").transition().duration(duration).style("opacity", 1);
          d3.select("#sidebar").style("height", height);
          d3.select("#sidebar").transition().duration(duration).style("background-color", "white");
          d3.select("#sidebar").style("z-index", 800);
          d3.select("h2").transition().duration(duration).style("opacity", null);
          isShow = true;
        }
      })
      controller.on("mouseenter", function () {
        d3.select(this).style("opacity", 1);
      })
      controller.on("mouseleave", function () {
        d3.select(this).style("opacity", opacity);
      })
    }
  } else {
    d3.select("#sidebar h1").html("Canyon Accident Cause Analysis");
    d3.select("#sidebar h2").html("Understand the causes and the correlations between each other.")
    d3.select("#legend-cause-size div:last-child").html("The count of the linked causes resulting in one single accident.");
    d3.select("#legend-injury-type div:first-child").html("Injury Type and its Severity Level");
    d3.select("#legend-correlation").style("display", null);
    d3.select("#legend-injury-type .item").style("align-items", null);
    d3.selectAll("#legend-injury-type .item div:first-child").style("border-radius", null).style("width", null).style("height", null);
    d3.select("#legend-note").html("");
    controller.style("display", "none");
    controller.style("opacity", 0);
    d3.select("#sidebar").style("z-index", null);
    d3.select("#sidebar").transition().duration(duration).style("background-color", null);
    d3.select("h2").transition().duration(duration).style("opacity", null);
    controller.select("img").attr("src", "source/show.svg");
  }
}



const find_in_object = (my_array, my_criteria) => {
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
const getNetworkData = (raw) => {

  nodeNeighbor = [];

  let network = {
    "nodes": [],
    "links": []
  };

  let maxValue = 1;

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
          "causeArray": cause.split(" "),
          "type": causeType[cause],
          "value": 1,
          "accidents": accident.split(),
        });
      } else {
        // if the node is exist
        let value = network.nodes[nodeIndex].value;
        network.nodes[nodeIndex].value = value + 1;
        network.nodes[nodeIndex].accidents.push(accident);
        if (network.nodes[nodeIndex].value > maxValue) { maxValue = network.nodes[nodeIndex].value }
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
    /*
    // deal with injury
    for (i = 0; i < injuries.length; i++) {
      if (injuryList.indexOf(injuries[i]) === -1) {
        injuryList.push(injuries[i]);
      }
    };
    */
  });

  function pushNodeNeighbor(cause, neighbor) {

    let index = getJsonArrayIndex(nodeNeighbor, "cause", cause);

    if (index === -1) {
      // if the cause exist in the nodeNeighbor array
      nodeNeighbor.push({
        "cause": cause,
        "neighbor": [],
      })
      nodeNeighbor[nodeNeighbor.length - 1]["neighbor"].push({ "name": neighbor, "value": 1 });

    } else {
      // if the cause is not exisit in the nodeNeighbor array
      // check if the neighbor exist or not
      const neighborIndex = getJsonArrayIndex(nodeNeighbor[index]["neighbor"], "name", neighbor);
      if (neighborIndex === -1) {
        // if the neighbor is not exist, push
        nodeNeighbor[index]["neighbor"].push({ "name": neighbor, "value": 1 });
      } else {
        // if the cause and neighbor both exist, modify value
        nodeNeighbor[index]["neighbor"][neighborIndex]["value"] = nodeNeighbor[index]["neighbor"][neighborIndex]["value"] + 1
      }
    }
  }

  return { network: network, maxValue: maxValue };
}

// transform raw data to detailed node-link dataset (accident and cause)
const getAccidentNetworkData = (data, cause) => {

  let network = {
    "nodes": [],
    "links": [],
  };

  let accidentNodes = [];
  let causeNodes = [];
  let accidentMax = 1;
  /*
    // for center cause node
    causeNodes.push({
      "id": cause,
      "name": cause,
      "category": "cause",
      "value": 1,
      //"accidents": d.id.split(),
    });
    */

  data.forEach(function (d) {

    // accident nodes
    accidentNodes.push({
      "id": d.id, // accident id
      "name": d.canyon,
      "canyon": d.canyon,
      "value": 1,
      "category": "accident",
      "date": d.date,
      "detailCause": d.detailCause.split(","),
      "injury": d.injury.split(","),
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

      if (detailCauses[i] !== cause) {
        // if detail cause equals selected cause, then do not do anything
        let nodeIndex = getJsonArrayIndex(causeNodes, "id", detailCauses[i]);

        if (nodeIndex === -1) {
          // if the node is not exist

          causeNodes.push({
            "id": detailCauses[i],
            "name": detailCauses[i],
            "category": "cause",
            "value": 1, // how many accident
            "accidents": d.id.split(),
            "injuryValue": injuryRating[d.injuryMax],
          });
        } else {
          // if the node is exist
          // count the average injury value (the weight of the cause node)
          causeNodes[nodeIndex].injuryValue = ((causeNodes[nodeIndex].injuryValue * causeNodes[nodeIndex].value) + injuryRating[d.injuryMax]) / (causeNodes[nodeIndex].value + 1)
          // count how many accident, determine the max
          causeNodes[nodeIndex].value = causeNodes[nodeIndex].value + 1;
          if (causeNodes[nodeIndex].value > accidentMax) { accidentMax = causeNodes[nodeIndex].value }
          // push accident
          causeNodes[nodeIndex].accidents.push(d.id);
        }

        // links

        network.links.push({
          "source": d.id,
          "target": detailCauses[i],
          "value": 1,
        });

      }

    }
    /*
    // source = accident, target = main cause
    network.links.push({
      "source": d.id,
      "target": cause,
      "value": 1,
    });
    */
  });


  accidentNodes.sort(function (a, b) { return +a.injuryValue - +b.injuryValue });
  causeNodes.sort(function (a, b) { return +a.injuryValue - +b.injuryValue });


  const dummyAccidents = new Array(accidentNodes.length).fill({
    "id": "dummy",
    "name": "Dummy",
    "category": "accident",
    "value": 0,
  });

  const dummyCauses = new Array(causeNodes.length).fill({
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

  return { network: network, accidentNum: accidentNodes.length, causeNum: causeNodes.length, accidentMax: accidentMax };
}

const getTreeData = (data, cause) => {


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



function showFilter(){
  console.log("fire showFilter")
  const filter = d3.select("#filter");
  filter.style("display","block");
}















// https://stackoverflow.com/a/53107778
const getPairs = array => (
  array.reduce((acc, val, i1) => [
    ...acc,
    ...new Array(array.length - 1 - i1).fill(0)
      .map((v, i2) => ([array[i1], array[i1 + 1 + i2]]))
  ], [])
)

const getJsonArrayIndex = (JsonArray, searchKey, value) => {
  let index = JsonArray.findIndex(function (item, k) {
    return item[searchKey] === value;
  });
  return index;
}

const isOutside = (node) => {

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
const getKeyByValue = (object, value) => {
  return Object.keys(object).find(key => object[key] === value);
}

// Adpat from https://stackoverflow.com/a/18561829
function getCoords(query) {
  let coord = document.querySelector(query).getBoundingClientRect();
  coord.cx = coord.x + coord.width / 2;
  coord.cy = coord.y + coord.height / 2;
  return coord;

};

// https://stackoverflow.com/a/5306832
const array_move = (arr, old_index, new_index) => {
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr; // for testing
};

const getCauseType = (cause) => {
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
    "Exposure",
  ]
  if (cause === "Unknown" || cause === "unknown") {
    type = "Unknown";
  } else {
    type = (naturalCauses.includes(cause)) ? "Natural environment" : "Human error";
  }
  return type
}