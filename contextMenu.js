function collapseAction(e, node) {
    collapse(e, node)
    closeContextMenu();
}

function contextMenu(e, node) {
    e.preventDefault();
    const contextMenu = document.querySelector('.context-menu');
    contextMenu.classList.toggle('context-menu-active');
    contextMenu.style.top = e.pageY + 'px';
    contextMenu.style.left = e.pageX + 'px';

    if (node.children || node._children) {
        // Active link
        document.querySelector('#context-menu-collapse').classList.remove('deactivated');
        document.querySelector('#context-menu-collapse').addEventListener('click', (e) => collapseAction(e, node))
    } else {
        // Inactive link
        document.querySelector('#context-menu-collapse').classList.add('deactivated');
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