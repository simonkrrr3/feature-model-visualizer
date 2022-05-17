const currentModel = littleModel; // Choose between littleModel and hugeModel.

function xmlToJson() {
    let m = currentModel.split('\n').splice(1).join('\n');
    
    const parser = new DOMParser();
    const xmlDocument = parser.parseFromString(m, "text/xml")

    const struct = xmlDocument.querySelector('struct');

    return getChildrenOfFeature(struct, true);
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