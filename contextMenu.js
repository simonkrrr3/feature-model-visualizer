function collapseAction(node) {
    collapse(node);
    closeContextMenu();
    updateSvg();
}

function contextMenu(e, node) {
    e.preventDefault();
    const contextMenu = document.querySelector('.context-menu');
    contextMenu.classList.toggle('context-menu-active');
    contextMenu.style.top = e.pageY + 'px';
    contextMenu.style.left = e.pageX + 'px';

    // Collapse
    if (node.children || node.collapsedChildren) {
        // Active link
        document.querySelector('#context-menu-collapse').classList.remove('deactivated');
        document.querySelector('#context-menu-collapse').addEventListener('click', () => collapseAction(node));
    } else {
        // Inactive link
        document.querySelector('#context-menu-collapse').classList.add('deactivated');
    }

    // Hide left siblings
    if (node.parent?.children?.length > 1 && node.parent.children[0].data.name !== node.data.name) {
        // Active link
        document.querySelector('#context-menu-toggle-left-siblings').addEventListener('click', () => toggleLeftSiblings(node));
    } else {
        // Inactive link
        document.querySelector('#context-menu-toggle-left-siblings').classList.add('deactivated');
    }

    // Hide right siblings
    if (node.parent?.children?.length > 1 && node.parent.children[node.parent.children.length - 1].data.name !== node.data.name) {
        // Active link
        document.querySelector('#context-menu-toggle-right-siblings').addEventListener('click', () => toggleRightSiblings(node));
    } else {
        // Inactive link
        document.querySelector('#context-menu-toggle-right-siblings').classList.add('deactivated');
    }
}

function closeContextMenu() {
    document.querySelectorAll('.context-menu-active').forEach(e => {
        e.classList.remove('context-menu-active');
    });
    const contextMenu = document.querySelector('.context-menu');
    const contextMenuClone = contextMenu.cloneNode(true);
    contextMenu.parentNode.replaceChild(contextMenuClone, contextMenu);
}

function toggleLeftSiblings(node) {
    const parent = node.parent;

    if (parent.areLeftChildrenHidden) {
        // Unhide hidden children.
        parent.children = [...parent.leftHiddenChildren, ...parent.children.slice(1)];
        parent.leftHiddenChildren = null;
    } else {
        // Hide all nodes left of specified node.
        parent.leftHiddenChildren = [];
        for (child of parent.children) {
            if (child.id === node.id) break;
            parent.leftHiddenChildren.push(child);
        }
        parent.children = parent.children.slice(parent.leftHiddenChildren.length);

        // Add pseudo node.
        const newNodeLeft = d3.hierarchy(new PseudoNode());
        newNodeLeft.parent = parent;
        parent.children = [newNodeLeft, ...parent.children];
    }
    
    // Toggle hidden.
    parent.areLeftChildrenHidden = !parent.areLeftChildrenHidden;
    
    closeContextMenu();
    updateSvg();
}

function toggleRightSiblings(node) {
    const parent = node.parent;
    
    if (parent.areRightChildrenHidden) {
        // Unhide hidden children.
        parent.children = [...parent.children.slice(0, -1), ...parent.rightHiddenChildren];
        parent.rightHiddenChildren = null;
    } else {
        // Hide all nodes right of specified node.
        parent.rightHiddenChildren = [];
        for (child of [...parent.children].reverse()) {
            if (child.id === node.id) break;
            parent.rightHiddenChildren.push(child);
        }
        parent.children = parent.children.slice(0, -parent.rightHiddenChildren.length);

        // Add pseudo node.
        const newNodeRight = d3.hierarchy(new PseudoNode());
        newNodeRight.parent = parent;
        parent.children = [...parent.children, newNodeRight];
    }
    
    // Toggle hidden.
    parent.areRightChildrenHidden = !parent.areRightChildrenHidden;

    closeContextMenu();
    updateSvg();
}