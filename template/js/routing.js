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
    var macAddr = cell.model.attributes.attrs.text.mac_addr;
    var ipAddr = cell.model.attributes.attrs.text.text;
    if (ipAddr.indexOf('.') == -1) {
        ipAddr = null;
    }
    console.log("show dialog for: ", macAddr, ipAddr);
    menuDialog(macAddr, ipAddr);
});

var menuDialog = function (macAddr, ipAddr) {
    var modalTemplate = '<div>\
        <form class="form-horizontal">\
            <div class="control-group">\
                <button class="btn btn-large btn-success btn-block" style="margin-top: 20px;" onclick="detailDialog(\'${macAddr}\');return false;">查看节点详情</button>\
                <button class="btn btn-large btn-warning btn-block" style="margin-top: 20px;" onclick="detailNetwork(\'${ipAddr}\');return false;">有线网络详情</button>\
                <button class="btn btn-large btn-primary btn-block" style="margin-top: 20px;" onclick="detailWireless(\'${ipAddr}\');return false;">无线网络详情</button>\
            </div>\
        </form>\
    </div>';

    bootbox.dialog({
        title: "菜单",
        message: Template(modalTemplate, {macAddr: macAddr, ipAddr: ipAddr}),
        className: "my-menu",
        buttons: {
            cancel: {
                label: "取消",
                className: "btn-sm btn-danger",
                callback: function () {
                }
            }
        }
    })
};

var detailDialog = function (macAddr) {
    bootbox.hideAll();
    var nodeDetail = getNodeDetail(macAddr);
    console.log(nodeDetail);
    if (!nodeDetail) {
        bootbox.alert('获取节点详情失败！');
        return
    }

    var modalTemplate = '\
    <form class="form-horizontal">\
        <div class="control-group">\
            <label class="control-label">设备编号：</label>\
            <div class="controls">\
                <input type="text" style="height: 30px" disabled value="${no}" />\
            </div>\
        </div>\
        <div class="control-group">\
            <label class="control-label">IP地址：</label>\
            <div class="controls">\
                <input type="text" style="height: 30px" disabled value="${ipaddress}" />\
            </div>\
        </div>\
        <div class="control-group">\
            <label class="control-label">adhoc0：</label>\
            <div class="controls">\
                <input type="text" style="height: 30px" disabled value="${adhoc0}"/>\
            </div>\
        </div>\
        <div class="control-group">\
            <label class="control-label">br-lan：</label>\
            <div class="controls">\
                <input type="text" style="height: 30px" disabled value="${br-lan}"/>\
            </div>\
        </div>\
        <div class="control-group">\
            <label class="control-label">eth1：</label>\
            <div class="controls">\
                <input type="text" style="height: 30px" disabled value="${eth1}"/>\
            </div>\
        </div>\
    </form>';

    bootbox.dialog({
        title: "查看详情",
        message: Template(modalTemplate, nodeDetail),
        className: "my-detail",
        buttons: {
            cancel: {
                label: "关闭",
                className: "btn-sm btn-danger",
                callback: function () {
                }
            }
        }
    })
};

var getToken = function (ipAddr) {
    var token = '';
    var data = JSON.stringify({
        url: 'http://' + ipAddr + '/cgi-bin/luci/rpc/auth',
        payload: JSON.stringify({method: "login", params: ["root", "root"]})
    });
    $.ajax({
        url: '/proxy',
        type: 'POST',
        async: false,
        data: data,
        success: function (jsonData) {
            if (jsonData) {
                token = jsonData.result;
            }
        }
    });
    return token;
};

var detailNetwork = function (ipAddr) {
    bootbox.hideAll();
    if (ipAddr == 'null') {
        bootbox.alert('获取有线网络信息失败！');
        return
    }
    var token = getToken(ipAddr);
    if (!token) {
        bootbox.alert('远程调用失败！');
        return
    }

    var data = JSON.stringify({
        url: 'http://' + ipAddr + '/cgi-bin/luci/rpc/uci?auth=' + token,
        payload: JSON.stringify({method: "get_all", params: ["network"]})
    });
    $.ajax({
        url: '/proxy',
        type: 'POST',
        async: false,
        data: data,
        success: function (jsonData) {
            if (jsonData) {
                var lan = jsonData.result.lan;
                console.log("network: ", lan);
                var modalTemplate = '\
                    <form class="form-horizontal">\
                        <div class="control-group">\
                            <label class="control-label">IP地址：</label>\
                            <div class="controls">\
                                <input type="text" style="height: 30px" disabled value="${ipaddr}" />\
                            </div>\
                        </div>\
                        <div class="control-group">\
                            <label class="control-label">子网掩码：</label>\
                            <div class="controls">\
                                <input type="text" style="height: 30px" disabled value="${netmask}"/>\
                            </div>\
                        </div>\
                        <div class="control-group">\
                            <label class="control-label">网络类型：</label>\
                            <div class="controls">\
                                <input type="text" style="height: 30px" disabled value="${type}"/>\
                            </div>\
                        </div>\
                        <div class="control-group">\
                            <label class="control-label">端口名称：</label>\
                            <div class="controls">\
                                <input type="text" style="height: 30px" disabled value="${ifname}"/>\
                            </div>\
                        </div>\
                        <div class="control-group">\
                            <label class="control-label">协议：</label>\
                            <div class="controls">\
                                <input type="text" style="height: 30px" disabled value="${proto}"/>\
                            </div>\
                        </div>\
                    </form>';
                bootbox.dialog({
                    title: "有线网络详情",
                    message: Template(modalTemplate, lan),
                    className: "my-detail",
                    buttons: {
                        cancel: {
                            label: "关闭",
                            className: "btn-sm btn-danger",
                            callback: function () {
                            }
                        }
                    }
                })
            }
        }
    });
};


var detailWireless = function (ipAddr) {
    bootbox.hideAll();
    if (ipAddr == 'null') {
        bootbox.alert('获取无线网络信息失败！');
        return
    }
    var token = getToken(ipAddr);
    if (!token) {
        bootbox.alert('远程调用失败！');
        return
    }

    var data = JSON.stringify({
        url: 'http://' + ipAddr + '/cgi-bin/luci/rpc/uci?auth=' + token,
        payload: JSON.stringify({method: "get_all", params: ["wireless"]})
    });
    $.ajax({
        url: '/proxy',
        type: 'POST',
        async: false,
        data: data,
        success: function (jsonData) {
            if (jsonData) {
                var wireless = jsonData.result.radio0;
                console.log("wireless: ", wireless);

                var modalTemplate = '\
                    <form class="form-horizontal">\
                        <div class="control-group">\
                            <label class="control-label">信道：</label>\
                            <div class="controls">\
                                <input type="text" style="height: 30px" disabled value="${channel}" />\
                            </div>\
                        </div>\
                        <div class="control-group">\
                            <label class="control-label">发射功率：</label>\
                            <div class="controls">\
                                <input type="text" style="height: 30px" disabled value="${txpower}"/>\
                            </div>\
                        </div>\
                        <div class="control-group">\
                            <label class="control-label">HTMODE：</label>\
                            <div class="controls">\
                                <input type="text" style="height: 30px" disabled value="${htmode}"/>\
                            </div>\
                        </div>\
                        <div class="control-group">\
                            <label class="control-label">硬件模式：</label>\
                            <div class="controls">\
                                <input type="text" style="height: 30px" disabled value="${hwmode}"/>\
                            </div>\
                        </div>\
                        <div class="control-group">\
                            <label class="control-label">国家：</label>\
                            <div class="controls">\
                                <input type="text" style="height: 30px" disabled value="${country}"/>\
                            </div>\
                        </div>\
                    </form>';

                bootbox.dialog({
                    title: "无线网络详情",
                    message: Template(modalTemplate, wireless),
                    className: "my-detail",
                    buttons: {
                        edit: {
                            label: "修改",
                            className: "btn-sm btn-primary",
                            callback: function () {
                                editWireless(ipAddr, wireless, token);
                            }
                        },
                        cancel: {
                            label: "关闭",
                            className: "btn-sm btn-danger",
                            callback: function () {
                            }
                        }
                    }
                })
            }
        }
    });
};

var editWireless = function (ipAddr, wireless, token) {
    bootbox.hideAll();

    var modalTemplate = '\
        <form class="form-horizontal">\
            <div class="control-group">\
                <label class="control-label">信道：</label>\
                <div class="controls">\
                    <input type="text" style="height: 30px" id="channel" value="${channel}" />\
                </div>\
            </div>\
            <div class="control-group">\
                <label class="control-label">发射功率：</label>\
                <div class="controls">\
                    <input type="text" style="height: 30px" id="txpower" value="${txpower}"/>\
                </div>\
            </div>\
            <div class="control-group">\
                <label class="control-label">HTMODE：</label>\
                <div class="controls">\
                    <input type="text" style="height: 30px" id="htmode" value="${htmode}"/>\
                </div>\
            </div>\
            <div class="control-group">\
                <label class="control-label">硬件模式：</label>\
                <div class="controls">\
                    <input type="text" style="height: 30px" disabled value="${hwmode}"/>\
                </div>\
            </div>\
            <div class="control-group">\
                <label class="control-label">国家：</label>\
                <div class="controls">\
                    <input type="text" style="height: 30px" disabled value="${country}"/>\
                </div>\
            </div>\
        </form>';

    bootbox.dialog({
        title: "无线网络编辑",
        message: Template(modalTemplate, wireless),
        className: "my-detail",
        buttons: {
            edit: {
                label: "保存",
                className: "btn-sm btn-primary",
                callback: function () {
                    var channel = $('#channel').val();
                    var htmode = $('#htmode').val();
                    var txpower = $('#txpower').val();
                    if (channel == '' || wireless.channel == channel) {
                        channel = ''
                    }
                    if (htmode == '' || wireless.htmode == htmode) {
                        htmode = ''
                    }
                    if (txpower == '' || wireless.txpower == txpower) {
                        txpower = ''
                    }
                    saveWirelessChanges(ipAddr, token, channel, htmode, txpower);
                }
            },
            cancel: {
                label: "关闭",
                className: "btn-sm btn-danger",
                callback: function () {
                }
            }
        }
    })
};

var saveWirelessChanges = function (ipAddr, token, channel, htmode, txpower) {
    console.log('about to save changes:', channel, htmode, txpower);
    var url = 'http://' + ipAddr + '/cgi-bin/luci/rpc/uci?auth=' + token;
    var flag = true;
    if (channel != '') {
        var channel_data = JSON.stringify({
            url: url,
            payload: JSON.stringify({method: "set", params: ["wireless.radio0.channel=" + channel]})
        });
        $.ajax({
            url: '/proxy',
            type: 'POST',
            async: false,
            data: channel_data,
            success: function (jsonData) {
                flag = Boolean(jsonData.result);
            }
        })
    }

    if (htmode != '') {
        var htmode_data = JSON.stringify({
            url: url,
            payload: JSON.stringify({method: "set", params: ["wireless.radio0.htmode=" + htmode]})
        });
        $.ajax({
            url: '/proxy',
            type: 'POST',
            async: false,
            data: htmode_data,
            success: function (jsonData) {
                flag = Boolean(jsonData.result);
            }
        })
    }
    if (txpower != '') {
        var txpower_data = JSON.stringify({
            url: url,
            payload: JSON.stringify({method: "set", params: ["wireless.radio0.txpower=" + txpower]})
        });
        $.ajax({
            url: '/proxy',
            type: 'POST',
            async: false,
            data: txpower_data,
            success: function (jsonData) {
                flag = Boolean(jsonData.result);
            }
        })
    }
    if (flag) {
        if (channel || htmode || txpower) {
            var commit_data = JSON.stringify({
                url: url,
                payload: JSON.stringify({method: "commit", params: ["wireless"]})
            });
            $.ajax({
                url: '/proxy',
                type: 'POST',
                async: false,
                data: commit_data,
                success: function (jsonData) {
                    if (jsonData.result) {
                        bootbox.alert("保存成功！")
                    } else {
                        bootbox.alert("保存失败请重试！")
                    }
                }
            })
        } else {
            bootbox.alert("保存成功！")
        }
    } else {
        var revert_data = JSON.stringify({
            url: url,
            payload: JSON.stringify({method: "revert", params: ["wireless"]})
        });
        $.ajax({
            url: '/proxy',
            type: 'POST',
            async: false,
            data: revert_data,
            success: function (jsonData) {
            }
        });
        bootbox.alert("保存失败请重试！")
    }
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

var Template = function (templateString, obj, recurse) {
    if (typeof recurse === "undefined") {
        recurse = 1;
    }
    $.each(obj, function (k, v) {
        if (typeof v === "function") {
            v = v(obj);
        }
        templateString = templateString.split("${" + k + "}").join(v);
    });
    if (templateString.indexOf("${") > -1 && recurse < 5) {
        return Template(templateString, obj, recurse);
    }
    return templateString;
};

$('#logout').on('click', function () {
    window.location.replace('http://admin@'+ window.location.host + '/logout');
});