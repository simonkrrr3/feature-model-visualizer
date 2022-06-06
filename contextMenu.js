function collapseAction(node) {
	node.data.toggleCollapse();
	updateCollapsing();
	closeContextMenu();
	updateSvg();
}

function contextMenu(e, node) {
	e.preventDefault();
	const contextMenu = document.querySelector('.context-menu');

	// First remove all deactivated classes
	document.querySelectorAll('.context-menu > ul > .deactivated').forEach((e) => e.classList.remove('deactivated'));

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

	// Highlight constraints
	if (node.data.constraints.length) {
		// Active link
		document.querySelector('#context-menu-highlight-constraints').addEventListener('click', () => {
			node.data.constraints.forEach((constraint) => constraint.toggleHighlighted());
			updateSvg();
		});
	} else {
		// Inactive link
		document.querySelector('#context-menu-highlight-constraints').classList.add('deactivated');
	}
}

function closeContextMenu() {
	document.querySelectorAll('.context-menu-active').forEach((e) => {
		e.classList.remove('context-menu-active');
	});
	const contextMenu = document.querySelector('.context-menu');
	const contextMenuClone = contextMenu.cloneNode(true);
	contextMenu.parentNode.replaceChild(contextMenuClone, contextMenu);
}

function toggleLeftSiblings(d3Node) {
	const parent = d3Node.parent;

	if (parent.children[parent.children.indexOf(d3Node) - 1].data instanceof PseudoNode) {
    const beforePseudoNode = parent.children.splice(0, parent.children.indexOf(d3Node) - 1);
    const insidePseudoNode = parent.children[parent.children.indexOf(d3Node) - 1].data.hiddenChildren;
    const afterPseudoNode = parent.children.splice(parent.children.indexOf(d3Node));

    parent.children = [...beforePseudoNode, ...insidePseudoNode, ...afterPseudoNode];
	} else {
		const d3NodeIndex = parent.children.indexOf(d3Node);
		const newPseudoNode = new PseudoNode(parent.children.slice(0, d3NodeIndex));
		parent.children = [d3.hierarchy(newPseudoNode), ...parent.children.slice(d3NodeIndex)];
	}

	closeContextMenu();
	updateSvg();
	focusNode(d3Node);
}

function toggleRightSiblings(d3Node) {
	// TODO: Implementation
}