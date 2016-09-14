var data = {
  "source_version" : "2013.3.0-14-gcd34783",
  "algorithm" : 4,
  "vis" : [
    { "primary" : "fe:f0:00:00:04:01",
      "neighbors" : [
         { "router" : "fe:f0:00:00:04:01",
           "neighbor" : "fe:f0:00:00:05:01",
           "metric" : "1.000" },
         { "router" : "fe:f0:00:00:04:01",
           "neighbor" : "fe:f0:00:00:03:01",
           "metric" : "1.008" }
      ],
      "clients" : [
         "00:00:43:05:00:04",
         "fe:f1:00:00:04:01"
      ]
    },
    { "primary" : "fe:f0:00:00:02:01",
      "neighbors" : [
         { "router" : "fe:f0:00:00:02:01",
           "neighbor" : "fe:f0:00:00:03:01",
  	       "metric" : "1.000" },
         { "router" : "fe:f0:00:00:02:01",
           "neighbor" : "fe:f0:00:00:01:01",
           "metric" : "1.016" },
         { "router" : "fe:f0:00:00:02:01",
           "neighbor" : "fe:f0:00:00:08:01",
           "metric" : "1.000" }
      ],
      "clients" : [
        "fe:f1:00:00:02:01",
        "00:00:43:05:00:02"
      ]
    }
  ]
}


var graph = new joint.dia.Graph();

var paper = new joint.dia.Paper({
    el: $('#paper'),
    width: 1000,
    height: 600,
    gridSize: 10,
    model: graph
});

var allNodes = [];

var newNode = function (name, px, py) {
    // 已存在的节点
    for (i = 0; i < allNodes.length; i ++ ) {
        if (allNodes[i].name == name) {
             return graph.getCell(allNodes[i].id)
        }
    }

    var node = new joint.shapes.basic.Rect({
        position: { x: px, y: py },
        size: { width: 120, height: 40 },
        attrs: {
            rect: {
                fill: {
                    type: 'linearGradient',
                    stops: [
                        { offset: '0%', color: '#f7a07b' },
                        { offset: '100%', color: '#fe8550' }
                    ],
                    attrs: { x1: '0%', y1: '0%', x2: '0%', y2: '100%' }
                },
                stroke: '#ed8661',
                'stroke-width': 2
            },
            text: {
                text: name,
                fill: '#f2f2f2',
                'font-size': 14,
                'font-weight': 'lighter'
            }
        }
    });
    graph.addCell(node);
    allNodes.push({name: name, id: node.id})
    return node;
}

var newRoute = function(node1, node2, label) {
    var link = new joint.dia.Link({
        source: { id: node1.id },
        target: { id: node2.id },
        router: { name: 'manhattan' },
        connector: { name: 'rounded' },
        attrs: {
            '.connection': {
                stroke: '#333333',
                'stroke-width': 2
            },
            '.marker-target': {
                fill: '#333333',
                d: 'M 10 0 L 0 5 L 10 10 z'
            }
        }
    });
    link.label(0, {
        position: 0.5,
        attrs: {
            text: { fill: '#333333', text: label }
        }
    });
    graph.addCell(link);
    link.toBack();
    return link
}


var p1 = newNode("fe:f0:00:00:04:01", 50, 50)
var p2 = newNode("fe:f0:00:00:02:01", 200, 50)
var p1_n1 = newNode("fe:f0:00:00:05:01", 350, 50)
var p1_n2 = newNode("fe:f0:00:00:03:01", 500, 50)
var p2_n1 = newNode("fe:f0:00:00:03:01", 50, 150)
var p2_n2 = newNode("fe:f0:00:00:01:01", 200, 150)
var p2_n3 = newNode("fe:f0:00:00:08:01", 350, 150)

var p1_r1 = newRoute(p1, p1_n1, "1.000")
var p1_r2 = newRoute(p1, p1_n2, "1.008")
var p2_r1 = newRoute(p2, p2_n1, "1.000")
var p2_r2 = newRoute(p2, p2_n2, "1.016")
var p2_r3 = newRoute(p2, p2_n3, "1.000")


graph.on('change:position', function(cell) {
    // has an obstacle been moved? Then reroute the link.
    //    if (_.contains(obstacles, cell)) paper.findViewByModel(link).update();
});

