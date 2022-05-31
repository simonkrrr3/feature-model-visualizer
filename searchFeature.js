document.querySelector('#feature-search').addEventListener('keyup', (e) => {
        allNodes.forEach((d) => {
            d.data.isSearched = false;
        });
        
        const paths = searchTree(rootNode, e.target.value, []);

        if (paths) {        
            paths.forEach((d) => d.data.isSearched = true);
            allNodes.forEach((d) => {
                collapse(d, d.data.isSearched);
            });

            updateSvg();
            focusNode(paths[paths.length - 1]);
        } else {
            updateSvg();
        } //TODO: Show error icon
        
    });

function searchTree(node, search, path){
    //TODO: Add levenshtein distance?
    if (search.length > 0 && node.data.name.includes(search)) { //if search is found return, add the object to the path and return it
        path.push(node);
        return path;
    } else if (node.children || node.collapsedChildren) { //if children are collapsed d3 object will have them instantiated as collapsedChildren
        let children = (node.children) ? node.children : node.collapsedChildren;
        for(let i = 0; i < children.length; i++){
            path.push(node); // we assume this path is the right one
            let found = searchTree(children[i], search, path);
            if(found){ // we were right, this should return the bubbled-up path from the first if statement
                return found;
            } else { //we were wrong, remove this parent from the path and continue iterating
                path.pop();
            }
        }
    } else { //not the right object, return false so it will continue to iterate in the loop
        return false;
    }
}