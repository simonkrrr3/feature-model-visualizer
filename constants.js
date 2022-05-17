const SVG_MARGIN = { top: 20, right: 90, bottom: 20, left: 90 };
const SVG_WIDTH = window.innerWidth - SVG_MARGIN.left - SVG_MARGIN.right;
const SVG_HEIGHT = window.innerHeight - SVG_MARGIN.top - SVG_MARGIN.bottom;

const RECT_MARGIN = { right: 8, left: 8 };
const RECT_HEIGHT = 35;

const MANDATORY_CIRCLE_RADIUS = 6;
const GROUP_SEGMENT_RADIUS = 40; // Radius of the segment that represents the 'alt' and 'and' groups.
const CHILDREN_COUNT_CIRCLE_RADIUS = 15;

const MONOSPACE_HEIGHT_WIDTH_FACTOR = 0.55;
const FEATURE_FONT_SIZE = 16;
const CHILREN_COUNT_FONT_SIZE = 9;

const SPACE_BETWEEN_NODES_HORIZONTALLY = 20;
const SPACE_BETWEEN_NODES_VERTICALLY = 160;

let nodeIdCounter = 0;