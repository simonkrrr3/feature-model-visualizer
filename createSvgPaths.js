// Helper functions for drawing alternative-group and and-group paths
const MOVE = 'M', LINE = 'L', CURVE = 'C', ARC = 'A', CLOSE = 'Z';

function polarToCartesian(point, radius, degrees) {
    const rad = degrees * Math.PI / 180.0;
    return {
        x: point.x + (radius * Math.cos(rad)),
        y: point.y + (radius * Math.sin(rad))
    };
}

function cartesianToAngle(centerPoint, point) {
    return Math.atan2(point.y - centerPoint.y, point.x - centerPoint.x) * 180.0 / Math.PI;
}

function translateToPathD(...data) {
    return data.join(' ');
}

function createPathDOfSegment(centerPoint, radius, startAngle, endAngle) {
    const start = polarToCartesian(centerPoint, radius, startAngle),
          end   = polarToCartesian(centerPoint, radius, endAngle);
    
    const a = translateToPathD(MOVE, toPath(end), ARC, radius, radius, 0, 0, 1, toPath(start));
    const b = translateToPathD(LINE, toPath(centerPoint), CLOSE);

    return translateToPathD(a, b, CLOSE);
}

function toPath({x, y}) {
    return `${x},${y}`;
}

function createGroupSegment(node, radius) {
    if (node.children && node.children.length > 1) {

        const firstChild = node.children[0].isPseudoElement ? node.children[1] : node.children[0];
        const lastChild = node.children[node.children.length - 1].isPseudoElement ? node.children[node.children.length - 2] : node.children[node.children.length - 1];

        const bottom_rect = {x: node.x, y: node.y + RECT_HEIGHT };
        const startAngle = cartesianToAngle(bottom_rect, firstChild);
        const endAngle = cartesianToAngle(bottom_rect, lastChild);
        return createPathDOfSegment({x: 0, y: RECT_HEIGHT}, radius, startAngle, endAngle);
    }

    return null;
}


function createLink(src, dest) {
    const src_y = src.y + RECT_HEIGHT;
    return `M ${src.x} ${src_y}
            L ${dest.x} ${dest.y}`;
}