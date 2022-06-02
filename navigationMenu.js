
let isColorCoded = false;

document.querySelector('#navigation-menu-count').addEventListener('click', () => {
    

    if (isColorCoded) {
        for (const node of allNodes) {
            node.data.color = node.data.isAbstract ? NODE_ABSTRACT_COLOR : NODE_COLOR;
        }
    } else {
        const count = {};
        let max = 0;
        for (const node of allNodes) {
            if (count[node.data.name]) {
                count[node.data.name] += 1;
                max = max < count[node.data.name] ? count[node.data.name] : max;
            } else {
                count[node.data.name] = 1;
                max = max < count[node.data.name] ? count[node.data.name] : max;
            }
        }
        
        const colors = d3.scaleLinear().domain([1, max]).range(['white', 'green']);

        for (const node of allNodes) {
            if (count[node.data.name] && !node.data.isAbstract) {
                node.data.color = colors(count[node.data.name]);
            }
        }
    }
    
    isColorCoded = !isColorCoded;

    updateSvg();
});