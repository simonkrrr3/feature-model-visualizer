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

const spaceBetweenNodesHorizontally = 20;
const spaceBetweenNodesVertically = 160;

let node_id_counter = 0;



// Flexlayout belongs to a d3-plugin that calculates the width between all nodes dynamically.
const flexLayout = d3.flextree()
    .nodeSize((node) => [calcRectWidth(node) + spaceBetweenNodesHorizontally, rect_height + spaceBetweenNodesVertically])
    .spacing((nodeA, nodeB) => nodeA.path(nodeB).length);

// Create root-feature-node with d3 and the data of the feature-model.
const rootFeature = d3.hierarchy(jsonModel, (d) => d.children);

const allNodes = rootFeature.descendants();




// Create svg-container.
const svg = d3
    .select('.svg-container')
    .append('svg')
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('viewBox', (-svg_width/2) + ' ' + -svg_margin.top + ' ' + svg_width + ' ' + svg_height)
    .on('click', closeContextMenu) // Click listener for closing all context-menus.
    .call(d3.zoom().scaleExtent([0.1, 8]).on("zoom", (event) => svgContent.attr('transform', event.transform))); // Zooming and penning.

// Create svg-content-element.
const svgContent = svg
    .append('g');




update();

function update() {
    // Remove all children from their parents if the parent is collapsed.
    // Otherwise reset the children attribute to temporary saved _children.
    allNodes.forEach((d) => {
        if (!d.data.isLeaf) {
            const children = d.children ? d.children : d._children;
            if (d.data.isCollapsed) {
                d._children = children;
                d.children = null;
            } else {
                d.children = children;
                d._children = null;
            }
        }
    });

    // Flexlayout belongs to a d3-plugin that calculates the width between all nodes dynamically.
    const treeData = flexLayout(rootFeature);
    
    // Get all nodes that do not have a collapsed parent.
    const visibleNodes = treeData.descendants();

    const node = svgContent
        .selectAll('g.node')
        .data(visibleNodes, (d) => d.id || (d.id = ++node_id_counter));


    // Enter new nodes
    const nodeEnter = node
        .enter()
        .append('g')
        .classed('node', true)
        .on('contextmenu', (e, d) => contextMenu(e, d)) // Open contextmenu with right-click on node.
        .on('click', (e, d) => collapseShortcut(e, d)); // Collapse node with Ctrl + left-click on node.

    nodeEnter
        .append('rect')
        .attr('x', (d) => -calcRectWidth(d) / 2)
        .attr('height', rect_height)
        .attr('width', (d) => calcRectWidth(d));
    nodeEnter
        .append('text')
        .attr('dy', rect_height / 2 + 5.5)
        .attr('font-size', letter_height)
        .text((d) => d.data.name);
    nodeEnter
        .append('circle')
        .classed('and-group-circle', true)
        .attr('r', circle_radius);
    nodeEnter
        .append('path')
        .classed('alt-group', true)
        .attr('opacity', (d) => d.data.groupType == 'alt' ? 1 : 0);
    nodeEnter
        .append('path')
        .classed('or-group', true)
        .attr('opacity', (d) => d.data.groupType == 'or' ? 1 : 0);

    // Enter circle with number of direct and total children.
    const childNodeNumberEnter = nodeEnter
        .filter((node) => !node.data.isLeaf)
        .append('g')
        .classed('child-node-number', true)
        .attr('transform', ((node) => 'translate(' + calcRectWidth(node) / 2 + ', ' + rect_height + ')'));
        childNodeNumberEnter
        .append('circle')
        .attr('r', 15);
        childNodeNumberEnter
        .append('text')
        .classed('child-node-number-text', true)
        .attr('dy', 2.5)
        .attr('font-size', letter_height - 7)
        .text((node) => node.data.childrenCount() + '|' + node.data.totalSubnodesCount());


    // Update nodes
    const nodeUpdate = nodeEnter.merge(node);
    nodeUpdate
        .attr('transform', (node) => 'translate(' + node.x + ', ' + node.y + ')');
    nodeUpdate
        .select('rect')
        .classed('abstract', (node) => node.data.isAbstract)
        .classed('is-searched-feature', (node) => node.data.isSearched)
    nodeUpdate
        .select('.and-group-circle')
        .classed('mandatory-and-group-circle', (node) => node.parent && node.parent.data.groupType === 'and' && node.data.isMandatory)
        .classed('optional-and-group-circle', (node) => node.parent && node.parent.data.groupType === 'and' && !node.data.isMandatory);
    nodeUpdate
        .select('.alt-group')
        .attr('d', (node) => drawSegment(node, segment_radius));
    nodeUpdate
        .select('.or-group')
        .attr('d', (node) => drawSegment(node, segment_radius));
    
        
    // Remove old/invisible nodes.
    const nodeExit = node
        .exit()
        .remove();


    // Links
    function createLink(src, dest) {
        var src_y = src.y + rect_height;
        return `M ${src.x} ${src_y}
                L ${dest.x} ${dest.y}`;
    }

    const links = treeData.descendants().slice(1);
    const link = svgContent
        .selectAll('path.link')
        .data(links, (node) => node.id);

    const linkEnter = link
        .enter()
        .insert('path', 'g')
        .classed('link', true);

    const linkUpdate = linkEnter.merge(link);
    linkUpdate
        .classed('is-searched-link', (node) => node.data.isSearched)
        .attr('d', (node) => createLink(node.parent, node));

    const linkExit = link
        .exit()
        .remove();
}

// Collapses all children of the specifed node with shortcut CTRL + left-click.
function collapseShortcut(event, node) {
    if (event.getModifierState("Control")) {
        node.data.collapse();
        update();
    }
}

// Calculates rect-witdh dependent on font-size dynamically.
function calcRectWidth(node) {
    return node.data.name.length * letter_width + rect_margin.left + rect_margin.right;
}
