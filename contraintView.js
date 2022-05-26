document.querySelector('.feature-model-constraints').addEventListener('mouseenter', (e) => {
    constraints.forEach((constraint, i) => {
        const constraintElement = e.target.appendChild(document.createElement("div"));
        constraintElement.innerText = constraint.toString();
        constraintElement.dataset.constraint = i;

        constraintElement.addEventListener('click', (e) => {
            constraints[e.target.dataset.constraint].getAllVars().forEach((varName => {
                varName.featureNode.color = 'lightgreen';
            }));

            updateSvg();
        })
    });
})

document.querySelector('.feature-model-constraints').addEventListener('mouseleave', (e) => {
    e.target.innerHTML = "Hover to see constraints"
})