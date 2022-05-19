const currentModel = hugeModel; // Choose between littleModel and hugeModel.

function xmlToJson() {
    const start = performance.now();
    let m = currentModel.split('\n').splice(1).join('\n');
    
    const parser = new DOMParser();
    const xmlDocument = parser.parseFromString(m, "text/xml")

    const struct = xmlDocument.querySelector('struct');

    const toReturn = getChildrenOfFeature(struct, true);
    console.log(performance.now() - start);
    return toReturn;    
}

function getChildrenOfFeature(struct, isRoot) {
    let toReturn = [];

    for (child of struct.childNodes) {
        if (child.tagName) {
            let toAppend = new FeatureNode(
                child.getAttribute('name'), 
                child.tagName, 
                isRoot,
                child.getAttribute('mandatory') === 'true', 
                child.getAttribute('abstract') === 'true',
                getChildrenOfFeature(child, false)
            );
            toReturn.push(toAppend);
        }
    }
    
    return toReturn;
}

const featureModelRawData = (xmlToJson())[0];