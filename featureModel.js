// Flexlayout belongs to a d3-plugin that calculates the width between all nodes dynamically.
let flexLayout = d3
    .flextree()
    .nodeSize((node) => [
        calcRectWidth(node) + SPACE_BETWEEN_NODES_HORIZONTALLY,
        RECT_HEIGHT + SPACE_BETWEEN_NODES_VERTICALLY,
    ])
    .spacing((nodeA, nodeB) => nodeA.path(nodeB).length);

// Create root-feature-node with d3 and the data of the feature-model.
const rootNode = d3.hierarchy(featureModelRawData, (node) => node.children);
const allNodes = rootNode.descendants();

const zoom = d3
    .zoom()
    .scaleExtent([0.1, 8])
    .on("zoom", (event) => svgContent.attr("transform", event.transform));

// Create svg-container.
const svg = d3
    .select(".svg-container")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr(
        "viewBox",
        -SVG_WIDTH / 2 + " " + -SVG_MARGIN.top + " " + SVG_WIDTH + " " + SVG_HEIGHT
    )
    .on("click", closeContextMenu) // Click listener for closing all context-menus.
    .call(zoom); // Zooming and penning.

const svgContent = svg.append("g");

const highlightedConstraintsContainer = svgContent
    .append("g")
    .classed("highlighted-constraints-container", true);

const linksContainer = svgContent.append("g").classed("link-container", true);

const featureNodesContainer = svgContent
    .append("g")
    .classed("feature-node-container", true);

// Collapses all nodes after depth 1.
rootNode.children.forEach((child) =>
    child.eachAfter((node) => node.data.collapse())
);
rootNode.data.uncollapse(true);
updateCollapsing();

updateSvg();

function updateFeatureNodes(visibleNodes) {
    const featureNode = featureNodesContainer.selectAll("g.node").data(
        visibleNodes.filter((node) => node.data instanceof FeatureNode),
        (node) => node.id || (node.id = ++nodeIdCounter)
    );

    // Enter new nodes
    const featureNodeEnter = featureNode
        .enter()
        .append("g")
        .classed("node", true)
        .on("contextmenu", (event, node) => contextMenu(event, node)) // Open contextmenu with right-click on node.
        .on("click", (event, node) => collapseShortcut(event, node)); // Collapse node with Ctrl + left-click on node.

    const rectAndTextEnter = featureNodeEnter
        .append("g")
        .classed("rect-and-text", true);
    rectAndTextEnter
        .append("rect")
        .attr("x", (node) => -calcRectWidth(node) / 2)
        .attr("height", RECT_HEIGHT)
        .attr("width", (node) => calcRectWidth(node))
        .attr("fill", "#ccccff");
    rectAndTextEnter
        .append("text")
        .attr("dy", RECT_HEIGHT / 2 + 5.5)
        .attr("font-size", FEATURE_FONT_SIZE)
        .text((node) => node.data.name);

    featureNodeEnter
        .filter((node) => !node.data.isRoot && node.parent.data.isAnd())
        .append("circle")
        .classed("and-group-circle", true)
        .attr("r", MANDATORY_CIRCLE_RADIUS);
    featureNodeEnter
        .filter((node) => node.data.isAlt())
        .append("path")
        .classed("alt-group", true);
    featureNodeEnter
        .filter((node) => node.data.isOr())
        .append("path")
        .classed("or-group", true);

    // Enter circle with number of direct and total children.
    const childrenCountEnter = featureNodeEnter
        .filter((node) => !node.data.isLeaf())
        .append("g")
        .classed("children-count", true)
        .attr(
            "transform",
            (node) =>
                "translate(" + calcRectWidth(node) / 2 + ", " + RECT_HEIGHT + ")"
        );
    childrenCountEnter
        .append("circle")
        .attr(
            "r",
            (node) =>
                (node.data.childrenCount() + "|" + node.data.totalSubnodesCount())
                    .length * CHILDREN_COUNT_LETTERS_TO_RADIUS
        );
    childrenCountEnter
        .append("text")
        .classed("children-count-text", true)
        .attr("dy", 2.5)
        .attr("font-size", CHILREN_COUNT_FONT_SIZE)
        .text(
            (node) => node.data.childrenCount() + "|" + node.data.totalSubnodesCount()
        );

    const pseudoNode = featureNodesContainer.selectAll("g.pseudo-node").data(
        visibleNodes.filter((node) => node.data instanceof PseudoNode),
        (node) => node.id || (node.id = ++nodeIdCounter)
    );
    const pseudoNodeEnter = pseudoNode
        .enter()
        .append("g")
        .classed("pseudo-node", true)
        .on("click", (event, node) =>
            node.data.side === "left"
                ? toggleLeftSiblings(node)
                : toggleRightSiblings(node)
        );
    pseudoNodeEnter.append("circle").attr("r", PSEUDO_NODE_SIZE);
    pseudoNodeEnter
        .append("text")
        .attr("font-size", 30)
        .attr("dy", 2)
        .attr("dx", -12)
        .text("...");

    // Update nodes
    const featureNodeUpdate = featureNodeEnter.merge(featureNode);
    featureNodeUpdate.attr(
        "transform",
        (node) => "translate(" + node.x + ", " + node.y + ")"
    );
    featureNodeUpdate
        .select(".and-group-circle")
        .classed(
            "mandatory-and-group-circle",
            (node) => node.parent && node.parent.data.isAnd() && node.data.isMandatory
        )
        .classed(
            "optional-and-group-circle",
            (node) =>
                node.parent && node.parent.data.isAnd() && !node.data.isMandatory
        );
    featureNodeUpdate
        .select(".alt-group")
        .attr("d", (node) => createGroupSegment(node, GROUP_SEGMENT_RADIUS));
    featureNodeUpdate
        .select(".or-group")
        .attr("d", (node) => createGroupSegment(node, GROUP_SEGMENT_RADIUS));

    const rectAndTextUpdate = featureNodeUpdate.select(".rect-and-text");
    rectAndTextUpdate
        .select("rect")
        .classed("is-searched-feature", (node) => node.data.isSearched)
        .attr("fill", (node) => node.data.color);
    rectAndTextUpdate
        .select("text")
        .attr("font-style", (node) => (node.data.isAbstract ? "italic" : "normal"));

    const pseudoNodeUpdate = pseudoNodeEnter.merge(pseudoNode);
    pseudoNodeUpdate.attr(
        "transform",
        (node) => "translate(" + node.x + ", " + (node.y + RECT_HEIGHT / 2) + ")"
    );

    // Remove old/invisible nodes.
    featureNode.exit().remove();
    pseudoNode.exit().remove();
}

function updateHighlightedConstraints(visibleNodes) {
    const highlightedConstraintNodes = highlightedConstraintsContainer
        .selectAll("g.highlighted-constraints")
        .data(
            visibleNodes.filter(
                (node) =>
                    node.data instanceof FeatureNode &&
                    node.data.constraintsHighlighted.length
            ),
            (node) => node.id || (node.id = ++nodeIdCounter)
        );

    const highlightedConstraintNodesEnter = highlightedConstraintNodes
        .enter()
        .append("g")
        .classed("highlighted-constraints", true);

    const highlightedConstraintNodeRects = highlightedConstraintNodesEnter
        .merge(highlightedConstraintNodes)
        .selectAll("rect")
        .data(
            (node) =>
                node.data.constraintsHighlighted.map((c) => ({
                    constraint: c,
                    d3Node: node,
                })),
            (json) => json.constraint.toString() + json.d3Node.id
        );

    // Enter highlighted constraint rects
    const highlightedConstraintNodeRectsEnter = highlightedConstraintNodeRects
        .enter()
        .append("rect")
        .attr("stroke", (json) => json.constraint.color)
        .attr("stroke-width", STROKE_WIDTH_CONSTANT)
        .attr("fill", "transparent");

    // Update highlighted constraint rects
    highlightedConstraintNodeRectsEnter
        .merge(highlightedConstraintNodeRects)
        .attr("x", (json) => -calcRectWidth(json.d3Node) / 2)
        .attr(
            "height",
            (_, i) =>
                RECT_HEIGHT + i * 2 * STROKE_WIDTH_CONSTANT + STROKE_WIDTH_CONSTANT
        )
        .attr(
            "width",
            (json, i) =>
                calcRectWidth(json.d3Node) +
                i * 2 * STROKE_WIDTH_CONSTANT +
                STROKE_WIDTH_CONSTANT
        )
        .attr(
            "transform",
            (json, i) =>
                "translate(" +
                (json.d3Node.x -
                    i * STROKE_WIDTH_CONSTANT -
                    STROKE_WIDTH_CONSTANT / 2) +
                ", " +
                (json.d3Node.y -
                    i * STROKE_WIDTH_CONSTANT -
                    STROKE_WIDTH_CONSTANT / 2) +
                ")"
        );

    // Remove constraints highlighted nodes
    highlightedConstraintNodes.exit().remove();
    highlightedConstraintNodeRects.exit().remove();
}

function updateLinks(visibleNodes) {
    const links = visibleNodes
        .slice(1)
        .filter((node) => node.data instanceof FeatureNode);
    const link = linksContainer
        .selectAll("path.link")
        .data(links, (node) => node.id);

    const linkEnter = link.enter().insert("path", "g").classed("link", true);

    const linkUpdate = linkEnter.merge(link);
    linkUpdate
        .classed("is-searched-link", (node) => node.data.isSearched)
        .attr("d", (node) => createLink(node.parent, node));

    const linkExit = link.exit().remove();
}

function updateSvg() {
    const start = performance.now();

    // Flexlayout belongs to a d3-plugin that calculates the width between all nodes dynamically.
    const visibleNodes = flexLayout(rootNode).descendants();

    updateHighlightedConstraints(visibleNodes);
    updateFeatureNodes(visibleNodes);
    updateLinks(visibleNodes);

    console.log("Rendertime", performance.now() - start);
}

// Collapses all children of the specifed node with shortcut CTRL + left-click.
function collapseShortcut(event, node) {
    if (event.getModifierState("Control")) {
        node.data.toggleCollapse();
        updateCollapsing();
        updateSvg();
    }
}

// Calculates rect-witdh dependent on font-size dynamically.
function calcRectWidth(node) {
    if (node.data instanceof FeatureNode) {
        return (
            node.data.name.length *
            (FEATURE_FONT_SIZE * MONOSPACE_HEIGHT_WIDTH_FACTOR) +
            RECT_MARGIN.left +
            RECT_MARGIN.right
        );
    } else if (node.data instanceof PseudoNode) {
        return PSEUDO_NODE_SIZE * 2;
    }
}

function focusNode(node) {
    d3.select("svg").call(zoom.translateTo, node.x, node.y);
}

function updateCollapsing() {
    allNodes.forEach((node) => {
        if (!node.data.isLeaf()) {
            if (node.data.isCollapsed && !node.collapsedChildren) {
                node.collapsedChildren = node.children;
                node.children = null;
            } else if (!node.data.isCollapsed && !node.children) {
                node.children = node.collapsedChildren;
                node.collapsedChildren = null;
            }
        }
    });
}
