document.querySelector('#feature-search').addEventListener('keydown', (e) => {
    if (e.keyCode === 13) { 
        allNodes.forEach((d) => d.data.isSearched = false);
        
        const paths = searchTree(root, e.target.value, []);        
        paths.forEach((d) => d.data.isSearched = true);
        allNodes.forEach((d) => {
            d.data.isCollapsed = !d.data.isSearched;
        });
        update();
    }
})

function searchTree(node, search, path){
    //TODO: Add levenshtein distance
    if(node.data.name === search) { //if search is found return, add the object to the path and return it
        path.push(node);
        return path;
    }
    else if(node.children || node._children){ //if children are collapsed d3 object will have them instantiated as _children
        let children = (node.children) ? node.children : node._children;
        for(let i=0; i<children.length; i++){
            path.push(node);// we assume this path is the right one
            let found = searchTree(children[i], search, path);
            if(found){// we were right, this should return the bubbled-up path from the first if statement
                return found;
            }
            else{//we were wrong, remove this parent from the path and continue iterating
                path.pop();
            }
        }
    }
    else{//not the right object, return false so it will continue to iterate in the loop
        return false;
    }
}