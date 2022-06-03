let isColorCoded = false;

document
  .querySelector("#navigation-menu-count")
  .addEventListener("click", () => colorNodes(countNodes));

document
  .querySelector("#navigation-menu-count-direct-children")
  .addEventListener("click", () => colorNodes(countDirectChildren, "aqua"));

document
  .querySelector("#navigation-menu-count-total-children")
  .addEventListener("click", () => colorNodes(countTotalChildren, "orange"));

function colorNodes(coloringFunction, color = "green") {
  if (isColorCoded) {
    for (const node of allNodes) {
      node.data.color = node.data.isAbstract ? NODE_ABSTRACT_COLOR : NODE_COLOR;
    }
  } else {
    const [count, max] = coloringFunction(); // Must return {"nodeName": integer}
    const colors = d3
      .scaleLinear()
      .domain(d3.ticks(1, max, COLORING_MAP.length))
      .range(COLORING_MAP);

    for (const node of allNodes) {
      if (count[node.data.name] !== undefined && !node.data.isAbstract) {
        node.data.color = colors(count[node.data.name]);
      }
    }
  }

  isColorCoded = !isColorCoded;

  updateSvg();
}

/**
 * Counts all nodes
 * @returns [{"nodeName": integer}, maxAmount]
 */
function countNodes() {
  let count = {};
  let max = 0;
  for (const node of allNodes) {
    if (count[node.data.name]) {
      count[node.data.name] += 1;
      max = max < count[node.data.name] ? count[node.data.name] : max;
    } else {
      count[node.data.name] = 1;
      max = max < count[node.data.name] ? count[node.data.name] : max;
    }
  }

  return [count, max];
}

function countDirectChildren() {
  let count = {};
  let max = 0;

  for (const node of allNodes) {
    count[node.data.name] = node.data.childrenCount();
    max = max < count[node.data.name] ? count[node.data.name] : max;
  }
  console.log(count);
  return [count, max];
}

function countTotalChildren() {
  let count = {};
  let max = 0;

  for (const node of allNodes) {
    count[node.data.name] = node.data.totalSubnodesCount();
    max = max < count[node.data.name] ? count[node.data.name] : max;
  }

  return [count, max];
}
