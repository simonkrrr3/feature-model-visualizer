

// Flexlayout belongs to a d3-plugin that calculates the width between all nodes dynamically.
let flexLayout = d3.flextree()
    .nodeSize((node) => [calcRectWidth(node) + SPACE_BETWEEN_NODES_HORIZONTALLY, RECT_HEIGHT + SPACE_BETWEEN_NODES_VERTICALLY])
    .spacing((nodeA, nodeB) => nodeA.isPseudoElement ? 0 : nodeA.path(nodeB).length);

// Create root-feature-node with d3 and the data of the feature-model.
const rootNode = d3.hierarchy(featureModelRawData, (d) => d.children);
const allNodes = rootNode.descendants();



const zoom = d3.zoom().scaleExtent([0.1, 8]).on("zoom", (event) => svgContent.attr('transform', event.transform));

// Create svg-container.
const svg = d3
    .select('.svg-container')
    .append('svg')
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('viewBox', (-SVG_WIDTH/2) + ' ' + -SVG_MARGIN.top + ' ' + SVG_WIDTH + ' ' + SVG_HEIGHT)
    .on('click', closeContextMenu) // Click listener for closing all context-menus.
    .call(zoom); // Zooming and penning.

// Create svg-content-element.
const svgContent = svg
    .append('g');



updateSvg();

// Remove all children from their parents if the parent is collapsed.
// Otherwise reset the children attribute to temporary saved collapsedChildren.
function collapse(node, collapseState = null) {
    collapseState = collapseState === null ? node.collapsedChildren : collapseState;

    if (!node.data.isLeaf) {
        if (node.collapsedChildren && collapseState) {
            node.children = node.collapsedChildren;
            node.collapsedChildren = null;
        } else if (node.children && !collapseState){
            node.collapsedChildren = node.children;
            node.children = null;
        }
    }     
}

function updateSvg() {
    const start = performance.now();
    
    // Flexlayout belongs to a d3-plugin that calculates the width between all nodes dynamically.
    const treeData = flexLayout(rootNode);
    
    // Get all nodes that do not have a collapsed parent.
    const visibleNodes = treeData.descendants();

    const node = svgContent
        .selectAll('g.node')
        .data(visibleNodes, (d) => d.id || (d.id = ++nodeIdCounter));

    visibleNodes.forEach(node => {
        if (node.data.isFocused) {
            d3.select('svg').call(zoom.translateTo, node.x, node.y);
            node.data.isFocused = false;
        }
    });

    // Enter new nodes
    const nodeEnter = node
        .enter()
        .append('g')
        .classed('node', true)
        .on('contextmenu', (e, d) => contextMenu(e, d)) // Open contextmenu with right-click on node.
        .on('click', (e, d) => collapseShortcut(e, d)); // Collapse node with Ctrl + left-click on node.

    const rectAndTextEnter = nodeEnter
        .append('g')
        .classed('rect-and-text', true);
    rectAndTextEnter
        .append('rect')
        .attr('x', (d) => -calcRectWidth(d) / 2)
        .attr('height', RECT_HEIGHT)
        .attr('width', (d) => calcRectWidth(d))
        .attr('fill', '#ccccff');
    rectAndTextEnter
        .append('text')
        .attr('dy', RECT_HEIGHT / 2 + 5.5)
        .attr('font-size', FEATURE_FONT_SIZE)
        .text((d) => d.data.name);

    nodeEnter
        .filter((node) => !node.data.isRoot && !node.data.isPseudoElement && node.parent.data.isAnd())
        .append('circle')
        .classed('and-group-circle', true)
        .attr('r', MANDATORY_CIRCLE_RADIUS);
    nodeEnter
        .filter((node) => !node.data.isPseudoElement && node.data.isAlt())
        .append('path')
        .classed('alt-group', true);
    nodeEnter
        .filter((node) => !node.data.isPseudoElement && node.data.isOr())
        .append('path')
        .classed('or-group', true);

    // Enter circle with number of direct and total children.
    const childrenCountEnter = nodeEnter
        .filter((node) => !node.data.isPseudoElement && !node.data.isLeaf)
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
    const rectAndTextUpdate = nodeUpdate
        .select('.rect-and-text');
    rectAndTextUpdate
        .select('rect')
        .classed('is-searched-feature', (node) => node.data.isSearched)
        .attr('fill', (node) => node.data.color ?? (node.data.isAbstract ? '#ebebff' : '#ccccff'));
    rectAndTextUpdate
        .select('text')
        .attr('font-style', (node) => node.data.isAbstract ? 'italic' : 'normal');
    nodeUpdate
        .select('.and-group-circle')
        .classed('mandatory-and-group-circle', (node) => node.parent && node.parent.data.isAnd() && node.data.isMandatory)
        .classed('optional-and-group-circle', (node) => node.parent && node.parent.data.isAnd() && !node.data.isMandatory);
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
    const links = treeData.descendants().slice(1).filter(node => !node.data.isPseudoElement);
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

    console.log('Rendertime', performance.now() - start);
}

// Collapses all children of the specifed node with shortcut CTRL + left-click.
function collapseShortcut(event, node) {
    if (event.getModifierState('Control')) {
        collapse(node);
        updateSvg();
    }
}

// Calculates rect-witdh dependent on font-size dynamically.
function calcRectWidth(node) {
    return node.data.name.length * (FEATURE_FONT_SIZE * MONOSPACE_HEIGHT_WIDTH_FACTOR) + RECT_MARGIN.left + RECT_MARGIN.right;
}
