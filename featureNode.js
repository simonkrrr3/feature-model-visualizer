class FeatureNode {
    constructor(parent, name, groupType, mandatory, abstract) {
        this.parent = parent;
        this.name = name;
        this.children = [];
        this.groupType = groupType;
        this.isRoot = parent === null;
        this.isMandatory = mandatory;
        this.isAbstract = abstract;
        this.color = this.isAbstract ? '#ebebff' : '#ccccff';
        this.constraints = [];
        this.constraintsHighlighted = [];
        this.isCollapsed = true;
    }

    childrenCount() {
        if (this.isLeaf()) {
            return 0 ;
        } else {
            return this.children.length; 
        }
    }

    totalSubnodesCount() {
        if (this.isLeaf()) {
            return 0;
        } else {
            let totalSubnodesCount = this.children.length;
            this.children.forEach((node) => { 
                totalSubnodesCount += node.totalSubnodesCount();
            });
            return totalSubnodesCount;
        }
    }

    isAnd() {
        return this.groupType === 'and';
    }
    
    isOr() {
        return this.groupType === 'or';
    }
    
    isAlt() {
        return this.groupType === 'alt';
    }

    isLeaf() {
        return this.children.length === 0;
    }

    uncollapse(toRoot = true) {
        this.isCollapsed = false;
        if (this.parent && toRoot) {
            this.parent.uncollapse();
        }
    }

    collapse() {
        this.isCollapsed = true;
    }

    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
    }
}

class PseudoNode { 
    constructor(side) {
        this.side = side;
    }
}