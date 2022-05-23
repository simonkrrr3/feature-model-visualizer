function collapseAction(node) {
    node.data.collapse();
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
    if (node.children || node._children) {
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
        document.querySelector('#context-menu-hide-left-siblings').classList.remove('deactivated');
        document.querySelector('#context-menu-hide-left-siblings').addEventListener('click', () => hideLeftSiblings(node));
    } else {
        // Inactive link
        document.querySelector('#context-menu-hide-left-siblings').classList.add('deactivated');
    }

    // Hide right siblings
    if (node.parent?.children.length > 1 && node.parent.children[node.parent.children.length - 1].data.name !== node.data.name) {
        // Active link
        document.querySelector('#context-menu-hide-right-siblings').classList.remove('deactivated');
        document.querySelector('#context-menu-hide-right-siblings').addEventListener('click', () => hideRightSiblings(node));
    } else {
        // Inactive link
        document.querySelector('#context-menu-hide-right-siblings').classList.add('deactivated');
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

function hideLeftSiblings(node) {
    for (child of node.parent.children) {
        if (node.data.name !== child.data.name) {
            child.data.isHidden = true;
        } else {
            break;
        }
    }

    node.parent.data.areLeftChildrenHidden = true;

    updateSvg();
}

function hideRightSiblings(node) {
    let toReverse = [...node.parent.children].reverse();

    for (child of toReverse) {
        if (node.data.name !== child.data.name) {
            child.data.isHidden = true;
        } else {
            break;
        }
    }

    node.parent.data.areRightChildrenHidden = true;

    updateSvg();
}