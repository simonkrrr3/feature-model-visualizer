const svg_margin = { top: 20, right: 90, bottom: 20, left: 90 };
const svg_width = window.innerWidth - svg_margin.left - svg_margin.right;
const svg_height = window.innerHeight - svg_margin.top - svg_margin.bottom;

const rect_margin = { right: 5, left: 5 };
const rect_height = 35;

const circle_radius = 6;

// Radius of the segment that represents the 'alt' and 'and' groups.
const segment_radius = 40;

const letter_width = 10;
const letter_height = 16;

const space_between_nodes = 20;

var node_id_counter = 0;
const duration = 500;

const svg = d3
    .select('.svg-container')
    .append('svg')
    .on('click', closeContextMenu)
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

const root = d3.hierarchy(jsonModel, (d) => d.children);
root.x0 = 0;
root.y0 = 0;

const allNodes = root.descendants();

root.descendants().forEach((d) => {
    if (d.data.isCollapsed) {
        d._children = d.children;
        d.children = null;
    }
});

update(root);

function update(source) {
    const treeData = flexLayout(root);

    // nodes
    const nodes = treeData.descendants();
    nodes.forEach((d) => {
        d.y = d.depth * 180;
    });

    const node = svg
        .selectAll('g.node')
        .data(nodes, (d) => d.id || (d.id = ++node_id_counter));


    // Enter new nodes
    const nodeEnter = node
        .enter()
        .append('g')
        .classed('node', true)
        .attr('transform', ((d) => 'translate(' + d.x + ', ' + d.y + ')'))
        .on('contextmenu', (e, d) => contextMenu(e, d))
        .on('click', (e, d) => collapseShortcut(e, d));
    nodeEnter
        .append('rect')
        .classed('abstract', (d) => d.isAbstract)
        .attr('height', rect_height)
        .attr('width', (d) => calcRectWidth(d))
        .attr('x', (d) => -calcRectWidth(d) / 2);
    nodeEnter
        .append('text')
        .attr('dy', rect_height / 2 + 5.5)
        .attr('font-size', letter_height)
        .text((d) => d.data.name);
    nodeEnter
        .append('circle')
        .classed('and-group-circle', true)
        .attr('r', circle_radius)
        .classed('mandatory-and-group-circle', (d) =>  d.parent && d.parent.data.groupType === 'and' && d.data.isMandatory)
        .classed('optional-and-group-circle', (d) => d.parent && d.parent.data.groupType === 'and' && !d.data.isMandatory);
    nodeEnter
        .append('path')
        .classed('alt-group', true)
        .attr('d', (node) => drawSegment(node, segment_radius))
        .attr('opacity', (d) => d.data.groupType == 'alt' ? 1 : 0);
    nodeEnter
        .append('path')
        .classed('or-group', true)
        .attr('d', (node) => drawSegment(node, segment_radius))
        .attr('opacity', (d) => d.data.groupType == 'or' ? 1 : 0);
    
    /*const childNodeNumberEnter = nodeEnter
        .filter((d) => !d.isLeaf)
        .append('g')
        .classed('child-node-number', true)
        .attr('transform', ((d) => 'translate(' + calcRectWidth(d)/2 + ', ' + rect_height + ')'));

    childNodeNumberEnter
        .append('circle')
        .attr('r', 15);

    childNodeNumberEnter
        .append('text')
        .classed('child-node-number-text', true)
        .attr('dy', 2.5)
        .attr('font-size', letter_height - 7)
        .text((d) => d.data.childrenCount() + '|10');*/




    // Update nodes
    const nodeUpdate = nodeEnter.merge(node);
    nodeUpdate
        .attr('transform', (d) => 'translate(' + d.x + ', ' + d.y + ')')
    nodeUpdate
        .select('rect')
        .classed('abstract', (d) => d.data.isAbstract)
        .classed('is-searched-feature', (d) => d.data.isSearched)
        .attr('height', rect_height)
        .attr('width', (d) => calcRectWidth(d));
    nodeUpdate
        .select('text')
        .attr('font-size', letter_height)
        .style('fill-opacity', 1);
    nodeUpdate
        .select('.and-group-circle')
        .attr('r', circle_radius)
        .classed('mandatory-and-group-circle', (d) => d.parent && d.parent.data.groupType === 'and' && d.data.isMandatory)
        .classed('optional-and-group-circle', (d) => d.parent && d.parent.data.groupType === 'and' && !d.data.isMandatory);
    nodeUpdate
        .select('.alt-group')
        .attr('d', (node) => drawSegment(node, segment_radius));
    nodeUpdate
        .select('.or-group')
        .attr('d', (node) => drawSegment(node, segment_radius));
    
    const childNodeNumberUpdate = nodeUpdate
        .filter((d) => !d.data.isLeaf)
        .append('g')
        .classed('child-node-number', true)
        .attr('transform', ((d) => 'translate(' + calcRectWidth(d)/2 + ', ' + rect_height + ')'));

    childNodeNumberUpdate
        .append('circle')
        .attr('r', 15);

    childNodeNumberUpdate
        .append('text')
        .classed('child-node-number-text', true)
        .attr('dy', 2.5)
        .attr('font-size', letter_height - 7)
        .text((d) => { return d.data.childrenCount() + '|' + d.data.totalSubnodesCount(); });



    // Remove old nodes
    const nodeExit = node
        .exit()
        //.transition()
        //.duration(duration)
        //.attr('transform', () => 'translate(' + source.x + ', ' + source.y + ')')
        .remove();
    /*nodeExit
        .select('rect')
        .attr('height', 0)
        .attr('width', 0);
    nodeExit
        .select('text')
        .attr('font-size', 0)
        .style('fill-opacity', 0);
    nodeExit
        .select('.and-group-circle')
        .attr('r', 0);*/



    // Links
    function diagonal(s, d) {
        var s_y = s.y + rect_height;
        return `M ${s.x} ${s_y}
                L ${d.x} ${d.y}`;
    }

    const links = treeData.descendants().slice(1);

    const link = svg
        .selectAll('path.link')
        .data(links, (d) => d.id);

    const linkEnter = link
        .enter()
        .insert('path', 'g')
        .classed('link', true)
        /*.attr('d', () => {
            var o = { x: source.x0, y: source.y };
            return diagonal(o, o);
        });*/
        .attr('d', (d) => diagonal(d.parent, d));

    const linkUpdate = linkEnter.merge(link);
    linkUpdate
        //.transition()
        //.duration(duration)
        .classed('is-searched-link', (d) => d.data.isSearched)
        .attr('d', (d) => diagonal(d.parent, d));

    const linkExit = link
        .exit()
        /*.transition()
        .duration(duration)
        .attr('d', (d) => { 
            var o = { x: source.x, y: source.y};
            return diagonal(o, o);
        })*/
        .remove();


    // Save old positions
    nodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
    });


}

// Click event
function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    update(d);
}

function collapseShortcut(event, node) {
    if (event.getModifierState("Control")) {
        collapse(node);
    }
}

function calcRectWidth(node) {
    return node.data.name.length * letter_width + rect_margin.left + rect_margin.right;
}
