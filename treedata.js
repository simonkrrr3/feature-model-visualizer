var treeData = {
    name: "Root",
    groupType: "root",
    children: [
        {
            name: "Knoten mit Oder-Gruppe",
            groupType: "or",
            children: [
                {
                    name: "Optional A",
                    isOptional: true
                },
                {
                    name: "Mandatory B",
                    isOptional: false
                },
                {
                    name: "Mandatory C",
                    groupType: "and",
                    children: [
                        {
                            name: "A"
                        },
                        {
                            name: "B"
                        },
                        {
                            name: "C"
                        },
                        {
                            name: "D"
                        },
                        {
                            name: "E"
                        },
                        {
                            name: "F"
                        }
                    ]
                },
                {
                    name: "Mandatory D"
                },
                {
                    name: "Optional E",
                    isOptional: true
                },
                {
                    name: "Mandatory F",
                    isOptional: false
                }
            ]
        },
        {
            name: "Knoten mit Alternative",
            groupType: "alternative",
            children: [
                {
                    name: "Alt 1"
                },
                {
                    name: "Alt 2"
                },
                {
                    name: "Alt 3"
                },
                {
                    name: "Alt 4"
                }
            ]
        }
    ]
}

addChildren(treeData, 20, 'Feature ');

function addChildren(node, maxNumber, name) {
    for (let i = 0; i < Math.floor(Math.random() * maxNumber); i++) {
        let groupType;
        switch (Math.floor(Math.random() * 3)) {
            case 0: groupType = 'or'; break;
            case 1: groupType = 'alternative'; break;
            default: groupType = 'and'; break;
        }

        const isOptional = (Math.floor(Math.random() * 2)) === 1;

        const newNode = {name: name + (i + 1) + '.', children: [], groupType: groupType, isOptional: isOptional};
        addChildren(newNode, Math.floor(Math.random() * (maxNumber - 1)), newNode.name);
        node.children.push(newNode);
    }
}