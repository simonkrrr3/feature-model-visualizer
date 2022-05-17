const currentModel = hugeModel; // Choose between littleModel and hugeModel.

function xmlToJson() {
    let m = currentModel.split('\n').splice(1).join('\n');
    
    const parser = new DOMParser();
    const xmlDocument = parser.parseFromString(m, "text/xml")

    const struct = xmlDocument.querySelector('struct');

    return getChildrenOfFeature(struct);
}

function getChildrenOfFeature(struct) {
    let toReturn = [];

    for (child of struct.childNodes) {
        if (child.tagName) {
            let toAppend = new FeatureNode(
                child.getAttribute('name'), 
                child.tagName, 
                child.getAttribute('mandatory') === 'true', 
                child.getAttribute('abstract') === 'true',
                getChildrenOfFeature(child)
            );
            toReturn.push(toAppend);
        }
    }

    return toReturn;
}

const featureModelRawData = (xmlToJson())[0];