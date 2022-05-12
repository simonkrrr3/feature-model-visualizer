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
    
    var a = translateToPathD(MOVE, toPath(end), ARC, radius, radius, 0, 0, 1, toPath(start));
    var b = translateToPathD(LINE, toPath(centerPoint), CLOSE);

    return translateToPathD(a, b, CLOSE);
}

function toPath({x, y}) {
    return `${x},${y}`;
}

function drawSegment(node, radius) {
    if (node.children && node.children.length > 1) {
        var firstChild = node.children[0];
        // var lastChild = node.children[node.children.length - 1]; Unnecessary because of symmetry

        var bottom_rect = {x: node.x, y: node.y + rect_height };
        var angle = cartesianToAngle(bottom_rect, firstChild);
        return createPathDOfSegment({x: 0, y: rect_height}, radius, angle, 180 - angle);
    }

    return null;
}