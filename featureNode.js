class FeatureNode {
    constructor(name, groupType, mandatory, abstract, children) {
        this.name = name;
        this.children = children;
        this.groupType = groupType;
        this.isMandatory = mandatory;
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
}