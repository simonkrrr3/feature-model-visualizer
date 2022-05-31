const SVG_MARGIN = { top: 20, right: 90, bottom: 20, left: 90 };
const SVG_WIDTH = window.innerWidth - SVG_MARGIN.left - SVG_MARGIN.right;
const SVG_HEIGHT = window.innerHeight - SVG_MARGIN.top - SVG_MARGIN.bottom - (window.innerHeight / 10); // To compensate for the footer

const RECT_MARGIN = { right: 8, left: 8 };
const RECT_HEIGHT = 35;

const MONOSPACE_HEIGHT_WIDTH_FACTOR = 0.6;
const MANDATORY_CIRCLE_RADIUS = 6;
const GROUP_SEGMENT_RADIUS = 40; // Radius of the segment that represents the 'alt' and 'and' groups.
const CHILDREN_COUNT_LETTERS_TO_RADIUS = 4.5 * MONOSPACE_HEIGHT_WIDTH_FACTOR;

const FEATURE_FONT_SIZE = 16;
const CHILREN_COUNT_FONT_SIZE = 7;

const SPACE_BETWEEN_NODES_HORIZONTALLY = 20;
let SPACE_BETWEEN_NODES_VERTICALLY = 75;

let nodeIdCounter = 0;

const PSEUDO_NODE_SIZE = 20;

const CONSTRAINT_HIGHLIGHT_COLORS = [
    "aqua",
    "blueviolet",
    "chartreuse",
    "crimson",
    "darkorange",
    "forestgreen",
    "red",
    "yellow",
    "inidigo",
];

let CONSTRAINT_HIGHLIGHT_COLORS_COUNTER = 0;

const STROKE_WIDTH_CONSTANT = 4;