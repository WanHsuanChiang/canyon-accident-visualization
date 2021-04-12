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
const svgPosition = getCoords("svg");
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
}

let filter = {
  canyonRating: "FR", //"FR","ACA"
}
let injuryList = [];
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

const injuryColor = function (injury) {
  let rating = injuryRating[injury];
  if (rating === 0) {
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


      //simulation.stop();

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
  d3.select(".tooltip").remove();
  svg.attr("id", "detail-chart");


  let networkSet = getAccidentNetworkData(data, cause);
  let network = networkSet.network;

  const links = network.links.map(d => Object.create(d));
  const nodes = network.nodes.map(d => Object.create(d));
  const radius = 20;
  const accidentNum = networkSet.accidentNum;
  const causeNum = networkSet.causeNum;
  const forceCenter = { x: width / 2, y: height / 4 };
  const layout = getLayout();
  
  function getLayout(){
    if(causeNum >= 30 || accidentNum >= 30) {
      return "horizontal"
    } else {return "radial"}
  }

  console.log(networkSet)


  const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id).strength(0))
    .force("charge", d3.forceManyBody().strength(-500))
    //.force("center", d3.forceCenter(0, 0))
    .force("collide", d3.forceCollide().strength(1).radius(function (d) { return (d.id === "dummy") ? 1 : 20 }))
    .force("r", d3.forceRadial(function (d) {
      let val;
      if (d.id === cause) {val = 0; } 
      else { val = (d.category === "accident") ? 100 : 300  }
      return val;
    }, 0, -100).strength(function(){
      if(layout === "horizontal"){return 0}
      else {return 2}
    }))
    .force("x", d3.forceX())
    .force("y", d3.forceY(function (d) {
      if(layout === "horizontal") { return (d.category === "accident") ? -100 : 100;} 
      else {return (d.category === "accident") ? 500 : 300;}
    }).strength(2))

  // detail with center
  let centerNode = d3.select('[title = "' + cause + '"]').attr("class", d3.select('[title = "' + cause + '"]').attr("class") + " center-node")
  .call(d3.drag()
  .on("start", dragstarted)
  .on("drag", dragged)
  .on("end", dragended));;

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

  d3.selectAll('[category="accident"]').attr("injury-max", function (d) { return d.injuryMax });
  d3.selectAll('[category="cause"]').attr("type", function (d) { return getCauseType(d.id) });






  let circles = node.append("circle")
    .attr("r", function (d) {
      return (d.id === "dummy") ? 1 : radius;
    })

    .on("mouseenter", mouseenter)
    .on("mouseleave", mouseleave)
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  d3.selectAll('[category="accident"] circle').style("fill", function (d) { return injuryColor(d.injuryMax) });

  let labels = node.append("text")
    .attr("text-anchor", "middle")
    .attr("class", "label")
    .attr('y', function(d){
      if(layout === "horizontal") {return (d.category === "accident") ?  -radius - 60 : radius +10 ;  }
      else {return 0}
    })
    .attr('x', 0)
    .attr("transform", function(d){
      if (layout === "horizontal") {
        return "rotate(-45 0,0) translate(50,60)"
      }
    });

  d3.selectAll('[category="cause"] text').text(function (d) { return d.id; });
  d3.selectAll('[category="accident"] text').style("fill", function(d){return injuryColor(d.injuryMax)})
  d3.selectAll('[category="accident"] text').append("tspan").text(function (d) { return  d.canyon });
  d3.selectAll('[category="accident"] text').append("tspan").text(function (d) { return  d.date }).attr("dy", "1.2em").attr("x", 0);

    



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


      // bug will remove after a time while stay

      // sleep time expects milliseconds
      function sleep(time) {
        if (status.isHover){return}
        return new Promise((resolve) => setTimeout(resolve, time));
      }
      // Usage!
      sleep(500).then(() => {
        // Do something after the sleep!
        
        if (!status.isTooltipHover && d3.select('.tooltip').attr("name") === d.id) {

          d3.select('.tooltip').remove();
          status.isTooltip = false;

        }

      });


    }

  }


}

const drawFilter = (array) => {
  let select = d3.select("#injury-option");
  for (i = 0; i < array.length; i++) {
    select.append("option").attr("value", array[i]).html(array[i]);
  }
}

const drawTooltip = (nodeData, data, cause) => {

  if (status.isHover && status.screen === "cause" ) {

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
      .style("fill", function (d) { return injuryColor(d.injury); });

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


const drawAccidentTooltip = (nodeData, data) => {

  if (status.isHover && status.screen === "detail" && nodeData.category === "accident" && !status.isTooltip) {

    status.isTooltip = true;

    let tooltip = d3.select("body").append("div")
      .attr("class", "tooltip accident-tooltip")
      .attr("injury-max", nodeData.injuryMax)
      .attr("name", nodeData.id);

    let tooltipTitle = tooltip.append("div").attr("class", "tooltip-title");
    tooltipTitle.append("h4").html(nodeData.canyon + ' (' + nodeData.date + ')');
    //tooltipTitle.append("span").attr("class", "date").html(nodeData.date);

    let tooltipList = tooltip.append("div").attr("class", "tooltip-list");
    // canyon
    tooltipList.append("div").attr("class", "canyon");
    d3.select(".canyon").append("div").html("Canyon");
    let locationString = d3.select(".canyon").append("div");
    if (nodeData.canyonUrl.includes("http")) {
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
    d3.select(".rating").append("div").html((filter.canyonRating === "FR") ? nodeData.canyonRatingFR : nodeData.canyonRatingACA);
    // cause
    tooltipList.append("div").attr("class", "cause");
    d3.select(".tooltip .cause").append("div").html("Causes");
    d3.select(".tooltip .cause").append("div").html(nodeData.detailCause.split(",").join(", "));

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
        tooltip.append("span").attr("class", "analysis-title").html("Analysis");
        tooltip.append("div").attr("class", "tooltip-analysis").html(analysisContent);
      }

    } catch {
      console.log("no accident analysis");
    }

    // view more button
    tooltip.append("div").attr("class", "view-more").append("a").attr("href", nodeData.accidentUrl).attr("target", "_blank").html("View More");



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
        status.isTooltipHover = true;
        d3.select(this).attr("highlighted",true);
      })
      .on("mouseleave", function () {
        status.isTooltipHover = false;
        d3.select(this).remove();
        status.isTooltip = false;
      })




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
const getAccidentNetworkData = (data, cause) => {

  let network = {
    "nodes": [],
    "links": [],
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

  return { network: network, accidentNum: accidentNodes.length, causeNum: causeNodes.length };
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

const pushNodeNeighbor = (cause, causeNeighbor) => {

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

  let element = document.querySelector(query);
  let coord = element.getBoundingClientRect();
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

const getCauseType = (detailCause) => {
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
    type = (naturalCauses.includes(detailCause)) ? "Natural environment" : "Human error";
  }
  return type
}