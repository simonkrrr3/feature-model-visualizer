class FeatureNode {
    constructor(name, groupType, isRoot, mandatory, abstract, children) {
        this.name = name;
        this.children = children;
        this.groupType = groupType;
        this.isRoot = isRoot;
        this.isMandatory = mandatory;
        this.isAbstract = abstract;
        this.isLeaf = children.length === 0;
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

    isAnd() {
        return this.groupType === 'and';
    }
    
    isOr() {
        return this.groupType === 'or';
    }
    
    isAlt() {
        return this.groupType === 'alt';
    }
}

class PseudoNode { 
    constructor(side) {
        this.side = side;
    }
}