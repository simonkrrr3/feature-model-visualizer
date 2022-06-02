document.querySelector("#feature-search").addEventListener("keyup", (e) => {
  const search = e.target.value;

  allNodes.forEach((d) => {
    d.data.isSearched = false;
  });

  if (search !== "") {
    const foundD3Node = findNode(search);
    const paths = foundD3Node.data.getAllNodesToRoot();

    paths.forEach((node) => (node.isSearched = true));
    allNodes.forEach((d3Node) => d3Node.data.collapse());

    foundD3Node.data.uncollapse(true);
    updateCollapsing();
    updateSvg();
    focusNode(foundD3Node);
  } else {
    updateSvg();
  }
});

function findNode(search) {
  [distance, node] = allNodes.reduce(
    ([previousDistance, previousNode], currentNode) => {
      const currentNodeName = currentNode.data.name.toLowerCase();
      if (
        currentNodeName !== search.toLowerCase() &&
        currentNodeName.includes(search.toLowerCase())
      ) {
        return [1, currentNode];
      }

      const currentDistance = levenshtein(
        currentNode.data.name.toLowerCase(),
        search.toLowerCase()
      );
      if (previousDistance <= currentDistance) {
        return [previousDistance, previousNode];
      } else {
        return [currentDistance, currentNode];
      }
    }
  );

  // TODO: If levenshtein distance is above a good value dont display anything?

  return node;
}
