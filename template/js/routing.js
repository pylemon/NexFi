var WIDTH = 1800;
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
    model: graph,
    interactive: function(cellView) {
        return !(cellView.model instanceof joint.dia.Link);
    }
});

var allNodes = [];
var newNode = function (name, px, py) {
    // 已存在的节点
    for (var i = 0; i < allNodes.length; i++) {
        if (allNodes[i].name == name) {
             return graph.getCell(allNodes[i].id)
        }
    }
    var name_text, node_detail;
    node_detail = getNodeDetail(name);
    if (node_detail) {
        name_text = node_detail.ipaddress;
    } else {
        name_text = name;
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
                mac_addr: name,
                text: name_text,
                fill: '#f2f2f2',
                'font-size': 14,
                'font-weight': 'lighter'
            }
        }
    });
    graph.addCell(node);
    allNodes.push({name: name, id: node.id});
    return node;
};

var newRoute = function(node1, node2, label) {
    var link = new joint.dia.Link({
        source: { id: node1.id },
        target: { id: node2.id },
        router: function(vertices, args, linkView) {
            if (linkView.sourceBBox && linkView.targetBBox) {
                var x1 = linkView.sourceBBox.x + linkView.sourceBBox.width / 2;
                var y1 = linkView.sourceBBox.y + linkView.sourceBBox.height / 2;
                var x2 = linkView.targetBBox.x + linkView.sourceBBox.width / 2;
                var y2 = linkView.targetBBox.y + linkView.sourceBBox.height / 2;
                var middlePoint = {
                    x: ((x1 + x2) / 2),
                    y: ((y1 + y2) / 2)
                };
                // console.log("source:", linkView.sourceBBox, "target:", linkView.targetBBox, "middle:", middlePoint);
                var offset = 13;
                if (x1 > x2 && y1 < y2) {
                    middlePoint.x += offset;
                    middlePoint.y += offset;
                } else if (x1 > x2 && y1 > y2) {
                    middlePoint.x -= offset;
                    middlePoint.y += offset;
                } else if (x1 < x2 && y1 < y2) {
                    middlePoint.x += offset;
                    middlePoint.y -= offset;
                } else if (x1 < x2 && y1 > y2) {
                    middlePoint.x -= offset;
                    middlePoint.y -= offset;
                } else if (x1 == x2 && y1 > y2) {
                    middlePoint.x -= offset;
                } else if (x1 == x2 && y1 < y2) {
                    middlePoint.x += offset;
                } else if (x1 < x2 && y1 == y2) {
                    middlePoint.y -= offset;
                } else if (x1 > x2 && y1 == y2) {
                    middlePoint.y += offset;
                }
                // console.log("result: ", middlePoint);
                vertices.push(middlePoint);
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
};


// 找mac对应的存储下来的position
var getSavedPosition = function (macAddr, posData) {
    if (posData.nodes == null) return null;
    for (var i = 0; i < posData.nodes.length; i++) {
        var name = posData.nodes[i].name;
        var pos = posData.nodes[i].position;
        if (macAddr == name) {
            return pos
        }
    }
    return null
};

// 解析原始JSON数据，返回全部需要绘制的节点列表
var drawNodesByJson = function (jsonData, posData) {
    var getPos = positionGenerator();
    var nodes = {};
    var visDt, i, k, pos, node, neighbor;

    // 绘制 primary 节点 和 neighbors 节点
    for (i = 0; i < jsonData.vis.length; i++) {
        visDt = jsonData.vis[i];
        pos = getSavedPosition(visDt.primary, posData);
        if (!pos) {
            pos = getPos();
        }
        node = newNode(visDt.primary, pos.x, pos.y);
        nodes[visDt.primary] = node;
        for (k = 0; k < visDt.neighbors.length; k++) {
            neighbor = visDt.neighbors[k];
            pos = getSavedPosition(neighbor.neighbor, posData);
            if (!pos) {
                pos = getPos();
            }
            node = newNode(neighbor.neighbor, pos.x, pos.y);
            nodes[neighbor.neighbor] = node;
        }
    }

    // 绘制路由
    for (i = 0; i < jsonData.vis.length; i++) {
        visDt = jsonData.vis[i];
        for (k = 0; k < visDt.neighbors.length; k++) {
            neighbor = visDt.neighbors[k];
            newRoute(nodes[neighbor.router], nodes[neighbor.neighbor], neighbor.metric);
        }
    }
};

var getVisJSON = function () {
    $.get(
        '/topo/vis',
        function (jsonData) {
            $.get('/topo/position', function (posData) {
                graph.clear();
                allNodes = [];
                drawNodesByJson(jsonData, posData);
            })
        }
    )
};

var saveVisPosition = function () {
    var data = graph.toJSON();
    var nodes = [];
    for (var i = 0; i < data.cells.length; i++) {
        var cell = data.cells[i];
        if (cell.type == "basic.Rect") {
            nodes.push({
                "name": cell.attrs.text.mac_addr,
                "position": cell.position
            })
        }
    }

    $.post(
        '/topo/position',
        JSON.stringify({
            nodes: nodes
        }),
        function (jsonData) {
            if (jsonData.status == 'ok') {
                bootbox.alert('保存成功')
            } else {
                bootbox.alert('保存失败')
            }
        }
    )
};

// 绑定刷新按钮
$('#vis-refresh').on('click', getVisJSON);
$('#vis-save').on('click', saveVisPosition);

// 初始化页面
getVisJSON();

paper.on('cell:pointerdblclick', function (cell) {
    console.log("dblclick on cell id:", cell.model.id);
    if (!cell.model.attributes.attrs.text) return;
    var macAddr = cell.model.attributes.attrs.text.text;

    console.log("show dialog for: ", macAddr);
    // bootbox.alert(macAddr);
    detailDialog(macAddr);
});

var detailDialog = function (macAddr) {
    // todo: 获取数据
    bootbox.dialog({
        title: "查看详情",
        message: $('#detailModal').clone().show(),
        className: "my-detail",
        buttons: {
            success: {
                label: "编辑",
                className: "btn-success",
                callback: function () {
                    editDialog(macAddr);
                }
            },
            cancel: {
                label: "取消",
                className: "btn-sm btn-danger",
                callback: function () {
                }
            }
        }
    })
};

var editDialog = function (macAddr) {
    bootbox.dialog({
        title: "编辑",
        message: $('#editModal').clone().show(),
        className: "my-detail",
        buttons: {
            success: {
                label: "保存",
                className: "btn-success",
                callback: function () {
                    saveNodeInfo(macAddr);
                }
            },
            cancel: {
                label: "取消",
                className: "btn-sm btn-danger",
                callback: function () {
                }
            }
        }
    })
};

var saveNodeInfo = function (macAddr) {
};

var getNodeDetail = function (macAddr) {
    var resp = null;
    $.ajax({
        url: '/node?macAddr=' + macAddr,
        type: "GET",
        async: false,
        success: function (jsonData) {
            if (jsonData.no != "") {
                resp = jsonData;
            }
        }
    });
    return resp;
};