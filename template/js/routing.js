var data = {
  "source_version" : "2014.4.0",
  "algorithm" : 4,
  "vis" : [
    { "primary" : "0e:03:01:00:10:14",
      "neighbors" : [
         { "router" : "0e:03:01:00:10:14",
           "neighbor" : "0e:03:01:00:10:0a",
           "metric" : "1.016" },
         { "router" : "0e:03:01:00:10:14",
           "neighbor" : "0e:03:01:00:10:1d",
           "metric" : "1.032" }
      ],
      "clients" : [
        "9a:10:83:ec:19:2b",
        "33:33:00:00:00:02",
        "01:00:5e:00:00:01",
        "33:33:ff:00:00:00",
        "33:33:00:01:00:02",
        "33:33:00:01:00:03",
        "3e:03:01:00:10:14",
        "33:33:ff:00:10:14",
        "9a:10:83:ec:19:2b",
        "33:33:00:00:00:01"
      ]
    },
    { "primary" : "0e:03:01:00:10:0a",
      "neighbors" : [
         { "router" : "0e:03:01:00:10:0a",
           "neighbor" : "0e:03:01:00:10:14",
           "metric" : "1.028" },
         { "router" : "0e:03:01:00:10:0a",
           "neighbor" : "0e:03:01:00:10:1d",
           "metric" : "1.032" }
      ],
      "clients" : [
        "33:33:00:00:00:02",
        "3a:ea:b0:6a:9e:e7",
        "33:33:ff:00:10:0a",
        "01:00:5e:00:00:01",
        "33:33:ff:00:00:00",
        "3e:03:01:00:10:0a",
        "33:33:00:01:00:02",
        "33:33:00:01:00:03",
        "3a:ea:b0:6a:9e:e7",
        "33:33:00:00:00:01"
      ]
    },
    { "primary" : "0e:03:01:00:10:1d",
      "neighbors" : [
         { "router" : "0e:03:01:00:10:1d",
           "neighbor" : "0e:03:01:00:10:0a",
           "metric" : "1.000" },
         { "router" : "0e:03:01:00:10:1d",
           "neighbor" : "0e:03:01:00:10:14",
           "metric" : "1.028" }
      ],
      "clients" : [
        "33:33:00:00:00:02",
        "01:00:5e:00:00:01",
        "33:33:ff:00:00:00",
        "33:33:ff:00:10:1d",
        "33:33:00:01:00:02",
        "33:33:00:01:00:03",
        "06:8e:64:eb:a1:d6",
        "06:8e:64:eb:a1:d6",
        "3e:03:01:00:10:1d",
        "33:33:00:00:00:01"
      ]
    }
  ]
}

//var data = {
//  "vis": [
//    {
//      "primary" : "0e:03:01:00:10:14",
//      "neighbors" : [
//        { "router" : "0e:03:01:00:10:14",
//          "neighbor" : "0e:03:01:00:10:0a",
//          "metric" : "1.028" }
//      ]
//    },
//    {
//      "primary" : "0e:03:01:00:10:0a",
//      "neighbors" : []
//    }
//  ]
//};

var WIDTH = 1000;
var HEIGHT = 600;

var positionGenerator = function () {
    var POSITIONS = [
       [50, 50], [200, 50], [350, 50], [500, 50], [650, 50], [800, 50],
       [50, 150], [200, 150], [350, 150], [500, 150], [650, 150], [800, 150],
       [50, 250], [200, 250], [350, 250], [500, 250], [650, 250], [800, 250],
       [50, 350], [200, 350], [350, 350], [500, 350], [650, 350], [800, 350],
       [50, 450], [200, 450], [350, 450], [500, 450], [650, 450], [800, 450],
       [50, 550], [200, 550], [350, 550], [500, 550], [650, 550], [800, 550]
    ];
    POSITIONS = POSITIONS.reverse();
    return function() {
        var pos = POSITIONS.pop();
        if (pos != undefined) {
            return {x: pos[0], y: pos[1]};
        } else {
            return {x: 0, y: 0};
        }
    }
};


var graph = new joint.dia.Graph();
var paper = new joint.dia.Paper({
    el: $('#paper'),
    width: WIDTH,
    height: HEIGHT,
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
        router: function(vertices, args, linkView) {
            if (linkView.sourcePoint && linkView.targetPoint) {
                var x1 = linkView.sourcePoint.x;
                var y1 = linkView.sourcePoint.y;
                var x2 = linkView.targetPoint.x;
                var y2 = linkView.targetPoint.y;
                var middlePoint = {
                    x: ((x1 + x2) / 2),
                    y: ((y1 + y2) / 2)
                }
                var offset = 8;
                if (x1 > x2 && y1 < y2) {
                    middlePoint.x += offset;
                    middlePoint.y += offset;
                } else if (x1 > x2 && y1 > y2) {
                    middlePoint.x -= offset;
                    middlePoint.y += offset;
                } else if (x1 < x2 && y1 < y2) {
                    middlePoint.x += offset;
                    middlePoint.y -= offset;
                } else if (x1 <= x2 && y1 >= y2) {
                    middlePoint.x -= offset;
                    middlePoint.y -= offset;
                }
                vertices.push(middlePoint)
            }
            return vertices
        },
        connector: { name: 'smooth' },
        attrs: {
            '.connection': {
                stroke: '#333333',
                'stroke-width': 1
            },
            '.marker-target': {
                fill: '#333333',
                d: 'M 10 0 L 0 5 L 10 10 z'
            }
        }
    });
    link.label(0, {
        position: 0.6,
        attrs: {
            text: { fill: '#333333', text: label }
        }
    });
    graph.addCell(link);
    link.toBack();
    return link
}


// 解析原始JSON数据，返回全部需要绘制的节点列表
var getNodesFromJson = function (jsonData) {
    var getPos = positionGenerator();
    nodes = {};

    // 绘制 primary 节点 和 neighbors 节点
    for (i = 0; i < data.vis.length; i++) {
        var visDt = data.vis[i];
        var pos = getPos();
        var node = newNode(visDt.primary, pos.x, pos.y);
        nodes[visDt.primary] = node;
        for (k = 0; k < visDt.neighbors.length; k++) {
            var neighbor = visDt.neighbors[k];
            var pos = getPos();
            var node = newNode(neighbor.neighbor, pos.x, pos.y);
            nodes[neighbor.neighbor] = node;
        }
    }

//    console.log(nodes)

    // 绘制路由
    for (i = 0; i < data.vis.length; i++) {
        var visDt = data.vis[i];
        for (k = 0; k < visDt.neighbors.length; k++) {
            var neighbor = visDt.neighbors[k];
            newRoute(nodes[neighbor.router], nodes[neighbor.neighbor], neighbor.metric);
        }
    }
}()


graph.on('change:position', function(cell) {
    // has an obstacle been moved? Then reroute the link.
    //    if (_.contains(obstacles, cell)) paper.findViewByModel(link).update();
});

