function collapseAction(d3Node) {
	d3Node.data.toggleCollapse();
	updateCollapsing();
	closeContextMenu();
	updateSvg();
}

function contextMenu(e, d3Node) {
	e.preventDefault();
	const contextMenu = document.querySelector('.context-menu');

	// First remove all deactivated classes
	document.querySelectorAll('.context-menu > ul > .deactivated').forEach((e) => e.classList.remove('deactivated'));

	contextMenu.classList.toggle('context-menu-active');
	contextMenu.style.top = e.pageY + 'px';
	contextMenu.style.left = e.pageX + 'px';

	// Collapse
	if (d3Node.children || d3Node.collapsedChildren) {
		// Active link
		document.querySelector('#context-menu-collapse').classList.remove('deactivated');
		document.querySelector('#context-menu-collapse').addEventListener('click', () => collapseAction(d3Node));
	} else {
		// Inactive link
		document.querySelector('#context-menu-collapse').classList.add('deactivated');
	}

	// Hide left siblings
	if (d3Node.parent?.children?.length > 1 && d3Node.parent.children[0].data.name !== d3Node.data.name) {
		// Active link
		document.querySelector('#context-menu-toggle-left-siblings').addEventListener('click', () => toggleLeftSiblings(d3Node));
	} else {
		// Inactive link
		document.querySelector('#context-menu-toggle-left-siblings').classList.add('deactivated');
	}

	// Hide right siblings
	if (d3Node.parent?.children?.length > 1 && d3Node.parent.children[d3Node.parent.children.length - 1].data.name !== d3Node.data.name) {
		// Active link
		document.querySelector('#context-menu-toggle-right-siblings').addEventListener('click', () => toggleRightSiblings(d3Node));
	} else {
		// Inactive link
		document.querySelector('#context-menu-toggle-right-siblings').classList.add('deactivated');
	}

	// Highlight constraints
	if (d3Node.data.constraints.length) {
		// Active link
		document.querySelector('#context-menu-highlight-constraints').addEventListener('click', () => {
			d3Node.data.constraints.forEach((constraint) => constraint.toggleHighlighted());
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
	if (d3Node.data.getLeftSibling().isHidden) {
		d3Node.data.unhideLeftSiblings();
	} else {
		d3Node.data.hideLeftSiblings();
	}
	
	closeContextMenu();
	updateHiding(d3Node.parent);
	updateSvg();
	focusNode(d3Node);
}

function toggleRightSiblings(d3Node) {
	if (d3Node.data.getRightSibling().isHidden) {
		d3Node.data.unhideRightSiblings();
	} else {
		d3Node.data.hideRightSiblings();
	}
	
	closeContextMenu();
	updateHiding(d3Node.parent);
	updateSvg();
	focusNode(d3Node);
}