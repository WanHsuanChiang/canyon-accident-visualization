graph = {"nodes" : [], "links" : []};
d3.csv("data/accident.csv", function(data){
    var keys = Object.keys(data[0]); //get the headers for the data
keys.splice(keys.indexOf('ID'), 1)//remove the IDs key

data.forEach(function(d){
  keys.forEach(function (key, i){
    if (d[key]!="none") { adduniquenodes(d[key]); } //add node if not "none"
      var c = 1; //checks next column to the i
      if (d[keys[i+c]]!= undefined && d[key] !== "none"){
        while (d[keys[i+c]] === "none"){
          c = c+1;     //jump to next column if "none" found
         }
        graph.links.push ({
          "source" : d[key],
          "target" : d[keys[i+c]],
          "value" : countvalues(key,d[key],keys[i+c],d[keys[i+c]]) 
        });
      }
    })
});

function adduniquenodes(value) {
    if (graph.nodes.indexOf(value) === -1){
      graph.nodes.push(value);
    }
}

function countvalues (sourcekey, source, targetkey, target) {
    var c = 0;
    data.forEach (function (d){
      if (d[sourcekey] === source && d[targetkey]===target){
        c++;
      }

    });
    return c;
}
console.log(graph);
})