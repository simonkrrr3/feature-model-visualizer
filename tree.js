const svg_margin = { top: 20, right: 90, bottom: 20, left: 90 };
const svg_width = window.innerWidth - svg_margin.left - svg_margin.right;
const svg_height = window.innerHeight - svg_margin.top - svg_margin.bottom;

const rect_margin = { right: 5, left: 5 };
const rect_height = 35;

const circle_radius = 6;

// Radius of the segment that represents the 'alternative' and 'and' groups.
const segment_radius = 40;

const letter_width = 10;
const letter_height = 16;

const space_between_nodes = 10;

var node_id_counter = 0;
const duration = 500;

const svg = d3
    .select('.container')
    .append('svg')
    .attr('width', svg_width + svg_margin.right + svg_margin.left)
    .attr('height', svg_height + svg_margin.top + svg_margin.bottom)
    .call(d3.zoom().scaleExtent([0.1, 8]).on("zoom", (event, d) => {
        svg.attr("transform", event.transform)
     }))
    .append('g')
    .attr('transform', 'translate(' + (svg_margin.left + svg_width / 2) + ', ' + svg_margin.top + ')');

const flexLayout = d3.flextree()
    .nodeSize((node) => [calcRectWidth(node) + space_between_nodes, rect_height])
    .spacing((nodeA, nodeB) => nodeA.path(nodeB).length);

const root = d3.hierarchy(littleModelJson, (d) => d.children);
root.x0 = 0;
root.y0 = 0;

update(root);



function update(source) {
    var treeData = flexLayout(root);

    // nodes
    var nodes = treeData.descendants();
    nodes.forEach((d) => { 
        d.y = d.depth * 180;
    });
    
    var node = svg
        .selectAll('g.node')
        .data(nodes, (d) => d.id || (d.id = ++node_id_counter));


    // Enter new nodes
    var nodeEnter = node
        .enter()
        .append('g')
        .classed('node', true)
        .attr('transform', (() => 'translate(' + source.x0 + ', ' + source.y0 + ')'))
        .on('click', collapse);
    nodeEnter
        .append('rect')
        .attr('height', 0)
        .attr('width', 0)
        .attr('x', (d) => -calcRectWidth(d) / 2);
    nodeEnter
        .append('text')
        .attr('dy', rect_height/2 + 5.5)
        .attr('font-size', 0)
        .text((d) => d.data.name);
    nodeEnter
        .append('circle')
        .classed('or-group-circle', true)
        .attr('r', 0);
    nodeEnter
        .append('path')
        .classed('alternative-group', true)
        .attr('d', (node) => drawSegment(node, 0))
        .attr('opacity', (d) => d.data.groupType == 'alternative' ? 1 : 0);
    nodeEnter
        .append('path')
        .classed('and-group', true)
        .attr('d', (node) => drawSegment(node, 0))
        .attr('opacity', (d) => d.data.groupType == 'and' ? 1 : 0);
    nodeEnter
        .append('circle')
        .classed('children-number', true)
        .attr('transform', ((d) => 'translate(0, ' + rect_height + ')'))
        //.attr('opacity', ((d) => d._children ? 1 : 0))
        .attr('r', 15);




    // Update nodes
    var nodeUpdate = nodeEnter.merge(node);
    nodeUpdate
        .transition()
        .duration(duration)
        .attr('transform', (d) => 'translate(' + d.x + ', ' + d.y + ')')
    nodeUpdate
        .select('rect')
        .attr('height', rect_height)
        .attr('width', (d) => calcRectWidth(d));
    nodeUpdate
        .select('text')
        .attr('font-size', letter_height)
        .style('fill-opacity', 1);
    nodeUpdate
        .select('.or-group-circle')
        .attr('r', circle_radius)
        .classed('optional-or-group-circle', (d) => d.parent && d.parent.data.groupType == 'or' && !d.data.mandatory)
        .classed('mandatory-or-group-circle', (d) => d.parent && d.parent.data.groupType == 'or' && d.data.mandatory);
    nodeUpdate
        .select('.alternative-group')
        .transition()
        .duration(duration)
        .attr('d', (node) => drawSegment(node, segment_radius));
    nodeUpdate
        .select('.and-group')
        .transition()
        .duration(duration)
        .attr('d', (node) => drawSegment(node, segment_radius));
    nodeUpdate
        .select('.children-number')
        .attr('opacity', ((d) => d.children == null ? 0 : 0));



    // Remove old nodes
    var nodeExit = node
        .exit()
        .transition()
        .duration(duration)
        .attr('transform', () => 'translate(' + source.x + ', ' + source.y + ')')
        .remove();
    nodeExit
        .select('rect')
        .attr('height', 0)
        .attr('width', 0);
    nodeExit
        .select('text')
        .attr('font-size', 0)
        .style('fill-opacity', 0);
    nodeExit
        .select('.or-group-circle')
        .attr('r', 0);
    


    // Links
    function diagonal(s, d) {
        var s_y = s.y + rect_height;
        return `M ${s.x} ${s_y}
                L ${d.x} ${d.y}`;
    }

    var links = treeData.descendants().slice(1);
    
    var link = svg
        .selectAll('path.link')
        .data(links, (d) => d.id);

    var linkEnter = link
        .enter()
        .insert('path', 'g')
        .classed('link', true)
        .attr('d', () => {
            var o = { x: source.x0, y: source.y };
            return diagonal(o, o);
        });

    var linkUpdate = linkEnter.merge(link);
    linkUpdate
        .transition()
        .duration(duration)
        .attr('d', (d) => diagonal(d.parent, d));

    var linkExit = link
        .exit()
        .transition()
        .duration(duration)
        .attr('d', (d) => { 
            var o = { x: source.x, y: source.y};
            return diagonal(o, o);
        })
        .remove();


    // Save old positions
    nodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
    });


    // Click event
    function collapse(event, d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }
}

function calcRectWidth(node) {
    return node.data.name.length * letter_width + rect_margin.left + rect_margin.right;
}
