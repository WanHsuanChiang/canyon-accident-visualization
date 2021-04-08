// Adapted from https://bl.ocks.org/heybignick/3faf257bbbbc7743bb72310d03b86ee8
// https://bl.ocks.org/steveharoz/8c3e2524079a8c440df60c1ab72b5d03
// https://bl.ocks.org/denisemauldin/cdd667cbaf7b45d600a634c8ae32fae5
// highlight nodes: https://stackoverflow.com/questions/14600967/d3-force-directed-graph-node-filtering

// variables
const dataUrl = "/data/cause.json";
const svg = d3.select("svg");
const width = window.innerWidth;
const height = window.innerHeight;
//var color = d3.scaleOrdinal(d3.schemeCategory20);

// https://stackoverflow.com/a/54466624
const graph = { "nodes": [], "links": [] };
d3.csv("data/accident.csv", function (data) {
  data.forEach(function (d) {
    adduniquenodes(d.cause);
    graph.links.push({
      "source": d.cause,
      "target": d.cause,
      "value": countvalues('cause', d.cause, 'cause', d.cause)
    });
  });

  function adduniquenodes(value) {
    if (graph.nodes.indexOf(value) === -1) {
      graph.nodes.push({
        "id": value,
        "value": 1,
      });
    }
  }

  function countvalues(sourcekey, source, targetkey, target) {
    var c = 0;
    data.forEach(function (d) {
      if (d[sourcekey] === source && d[targetkey] === target) {
        c++;
      }
    });
    return c;
  }
  console.log(graph);
})







// simulation
let simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(function (d) { return d.id; }))
  .force("charge", d3.forceManyBody())
  .force("center", d3.forceCenter(width / 2, height / 2));
//.force("x", d3.forceX())
//.force("y", d3.forceY());


d3.json(dataUrl, function (error, graph) {
  if (error) throw error;

  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("stroke-width", function (d) { return Math.sqrt(d.value); });

  var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(graph.nodes)
    .enter().append("g")

  var circles = node.append("circle")
    .attr("r", function (d) { return Math.sqrt(d.value); })
    //.attr("class", function (d) { return d.group; })
    //.attr("fill", function(d) { return color(d.group); })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  var lables = node.append("text")
    .text(function (d) {
      return d.id;
    })
    .attr('x', 6)
    .attr('y', 3);

  node.append("title")
    .text(function (d) { return d.id; });

  simulation
    .nodes(graph.nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(graph.links);

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
});



// drag and drop
function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

// https://stackoverflow.com/a/27211777
function getPossiblepairs(input, diff) {
  // Create a copy of the original array, so it is not affected by the next operation
  var sortedInput = input.slice();
  // Sort the array
  sortedInput.sort();
  // Iterate through the array, starting from the 0th element
  for (var i = 0, n = sortedInput.length; i < n; i++) {
    firstNumber = sortedInput[i];
    // Iterate through the array, starting from the (i+1)th element
    for (var j = i + 1; j < n; j++) {
      secondNumber = sortedInput[j];
      // if it matches, then log it!
      if (secondNumber - firstNumber == diff) {
        console.log('(' + firstNumber + ', ' + secondNumber + ')');
        break;
      }
    }
  }
}