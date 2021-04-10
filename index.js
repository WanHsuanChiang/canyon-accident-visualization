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


// draw function
// https://bl.ocks.org/heybignick/3faf257bbbbc7743bb72310d03b86ee8
function draw(data) {

  let network = getNetworkData(data);

  ctx.GRPAH = "cause";
  status.screen = "cause";

  d3.selectAll("line").exit();
  d3.select(".nodes").selectAll("g").exit();
  svg.selectAll("*").remove();


  svg.attr("viewBox", [-width / 2, -height / 2, width, height]);




  const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id))
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(0, 0))
    .force("collide", d3.forceCollide().strength(0.5).radius(70))
    .force("x", d3.forceX())
    .force("y", d3.forceY());
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
    .attr("stroke-width", function (d) { return Math.sqrt(d.value) * 2; });

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
    .attr('y', 0);


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
    .on("click", click );


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
    console.log("fire dragend");
    status.isDragging = false;
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    d3.selectAll(".node").attr("highlighted", null);
    d3.selectAll(".link").attr("highlighted", null);
    d3.select('.tooltip').attr("highlighted", null);
    if(status.isTooltip){
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

    status.screen = "detail";

    if (screen)
    // what it passed? d?\ 
    d3.selectAll(".nodes").data(data).exit(); 
    d3.selectAll(".links").data(data).exit();
    d3.selectAll(".links").remove();
    d3.selectAll('.node:not([title="'+clickedNode.attr("title")+'"])').remove();

    //simulation.stop();

    console.log(data.filter(function(d){return d.cause.includes(   clickedNode.attr("title")  )        }));

    //drawDetail(data.filter(function(d){return d.cause.includes(   d3.select(this).attr("title")  )        }));
 


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
  };

}


function drawDetail(data, cause) {


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
      .attr("class", "tooltip")
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
      .attr("injury-max",function(d){return d.injury});

    let percentSoFar = 0;
    injuryBar.append("rect")
      .attr("height","5px")
      .attr("width", function (d) { return ((d.value / total) * 100) + "%" })
      .attr("y", 0)
      .attr("x",function(d){
        let prePrecent =percentSoFar;
        let thisPrecent = (d.value / total)*100;
        percentSoFar = percentSoFar + thisPrecent;
        return prePrecent + "%";
      })

    injuryBar.append("text").text(function(d){return d.injury})
    .attr("y",8 )
    .attr("x",function(d){ return d3.select('[injury-max = "'+d.injury +'"] rect').attr("x") } );  


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
function getAccidentNetworkData(data) {

  let network = {
    "nodes": [],
    "links": []
  };

  let accidentNodes = [];
  let causeNodes = [];

  data.forEach(function (d) {
    //deal with cause
    let detailCauses = d.detailCause.split(",").sort();
    let injuries = d.injury.split(",").sort();    

    // accident nodes
    
    accidentNodes.push({
      "id": d.id, // accident id
      "name": d.canyon,
      "value": 1,
      "category": "accident",
      "date": d.date,
      /*
      "detailCause": d.detailCause,
      "injury": d.injury.split(),
      "injuryMax": d.injuryMax,      
      "area": d.area,
      "country": d.country,
      "canyonRatingACA": d.difficulty.split("(")[0].trim(),
      "canyonRatingFR": d.difficulty.split("(")[1].split(")")[0].trim(),
      "hasSwiftWater": d.difficulty.includes("Swift water"),
      "canyonUrl": d.canyonUrl,
      "accidentUrl": d.url,
      */
    })
    
    for (i = 0; i < detailCauses.length; i++) {

      // cause nodes

      let detailCause = detailCauses[i];
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
        let value = network.nodes[nodeIndex].value;
        causeNodes[nodeIndex].value = value + 1;
        causeNodes[nodeIndex].accidents.push(d.id);
      }

      // links

      network.links.push({
        "source": d.id,
        "target": d.detailCause,
        "value": 1,
      });
    }
  });

  network.nodes = causeNodes.concat(accidentNodes);

  console.log(network);

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
  let coor = node.getBoundingClientRect();
  if (coor.top < 0 || coor.left < 0 || coor.bottom < 0 || coor.right < 0) {
    return true;
  } else {
    return false;
  }
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