class FeatureNode {
    constructor(name, groupType, isRoot, mandatory, abstract, children, isHidden = false) {
        this.name = name;
        this.children = children;
        this.groupType = groupType;
        this.isRoot = isRoot;
        this.isMandatory = mandatory;
        this.isHidden = isHidden;
        this.isPseudoElement = false;
        this.areLeftChildrenHidden = false;
        this.areRightChildrenHidden = false;
        this.isAbstract = abstract;
        this.isLeaf = children.length === 0;
        this.isCollapsed = this.childrenCount() > 2;
    }

    childrenCount() {
        if (this.isLeaf) {
            return 0 ;
        } else {
            return this.children.length; 
        }
    }

    totalSubnodesCount() {
        if (this.isLeaf) {
            return 0;
        } else {
            let totalSubnodesCount = this.children.length;
            this.children.forEach((node) => { 
                totalSubnodesCount += node.totalSubnodesCount();
            });
            return totalSubnodesCount;
        }
    }

    collapse() {
        this.isCollapsed = !this.isCollapsed;
    }

    getNonCollapsedChildren() {
        return this.isCollapsed ? [] : this.children;
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

    addPseudoElementsIfNecessary() {
        if (!this.isCollapsed) {
            if (this.areLeftChildrenHidden) {
                this.children.splice(0, 0, {});
            }

            if (this.areRightChildrenHidden) {
                this.children.push({});
            }
        }
    }
}