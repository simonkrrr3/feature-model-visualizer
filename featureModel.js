// Flexlayout belongs to a d3-plugin that calculates the width between all nodes dynamically.
const flexLayout = d3.flextree()
    .nodeSize((node) => [calcRectWidth(node) + SPACE_BETWEEN_NODES_HORIZONTALLY, RECT_HEIGHT + SPACE_BETWEEN_NODES_VERTICALLY])
    .spacing((nodeA, nodeB) => nodeA.path(nodeB).length);

// Create root-feature-node with d3 and the data of the feature-model.
const rootNode = d3.hierarchy(featureModelRawData, (d) => d.children);

const allNodes = rootNode.descendants();




// Create svg-container.
const svg = d3
    .select('.svg-container')
    .append('svg')
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('viewBox', (-SVG_WIDTH/2) + ' ' + -SVG_MARGIN.top + ' ' + SVG_WIDTH + ' ' + SVG_HEIGHT)
    .on('click', closeContextMenu) // Click listener for closing all context-menus.
    .call(d3.zoom().scaleExtent([0.1, 8]).on("zoom", (event) => svgContent.attr('transform', event.transform))); // Zooming and penning.

// Create svg-content-element.
const svgContent = svg
    .append('g');




updateSvg();

function updateSvg() {
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
    const treeData = flexLayout(rootNode);
    
    // Get all nodes that do not have a collapsed parent.
    const visibleNodes = treeData.descendants();

    const node = svgContent
        .selectAll('g.node')
        .data(visibleNodes, (d) => d.id || (d.id = ++nodeIdCounter));


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
        .attr('height', RECT_HEIGHT)
        .attr('width', (d) => calcRectWidth(d));
    nodeEnter
        .append('text')
        .attr('dy', RECT_HEIGHT / 2 + 5.5)
        .attr('font-size', FEATURE_FONT_SIZE)
        .text((d) => d.data.name);
    nodeEnter
        .append('circle')
        .classed('and-group-circle', true)
        .attr('r', MANDATORY_CIRCLE_RADIUS);
    nodeEnter
        .append('path')
        .classed('alt-group', true)
        .attr('opacity', (d) => d.data.groupType == 'alt' ? 1 : 0);
    nodeEnter
        .append('path')
        .classed('or-group', true)
        .attr('opacity', (d) => d.data.groupType == 'or' ? 1 : 0);

    // Enter circle with number of direct and total children.
    const childrenCountEnter = nodeEnter
        .filter((node) => !node.data.isLeaf)
        .append('g')
        .classed('children-count', true)
        .attr('transform', ((node) => 'translate(' + calcRectWidth(node) / 2 + ', ' + RECT_HEIGHT + ')'));
    childrenCountEnter
        .append('circle')
        .attr('r', CHILDREN_COUNT_CIRCLE_RADIUS);
    childrenCountEnter
        .append('text')
        .classed('children-count-text', true)
        .attr('dy', 2.5)
        .attr('font-size', CHILREN_COUNT_FONT_SIZE)
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
        .attr('d', (node) => createGroupSegment(node, GROUP_SEGMENT_RADIUS));
    nodeUpdate
        .select('.or-group')
        .attr('d', (node) => createGroupSegment(node, GROUP_SEGMENT_RADIUS));
    
        
    // Remove old/invisible nodes.
    const nodeExit = node
        .exit()
        .remove();


    // Links
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
        updateSvg();
    }
}

// Calculates rect-witdh dependent on font-size dynamically.
function calcRectWidth(node) {
    return node.data.name.length * (FEATURE_FONT_SIZE * MONOSPACE_HEIGHT_WIDTH_FACTOR) + RECT_MARGIN.left + RECT_MARGIN.right;
}
