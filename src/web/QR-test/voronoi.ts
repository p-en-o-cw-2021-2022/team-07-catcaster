import {Voronoi} from 'voronoi';

export function findNeighborsVoronoi(sites: {x: number; y: number; id: string}[]) {

    const voronoi = new Voronoi();
    const bbox = {xl: 0, xr: 800, yt: 0, yb: 600}; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom

    const diagram = voronoi.compute(sites, bbox);



    const neighbors: Array<[[number, number], [number, number]]> = [];


    for (let i = 0; i < diagram.edges.length; i++) {
        const currentEdge = diagram.edges[i];
        if (currentEdge.lSite != null && currentEdge.rSite != null) {
            const neighborPair: [[number, number], [number, number]] = [[currentEdge.lSite.x, currentEdge.lSite.y], [currentEdge.rSite.x, currentEdge.rSite.y]];
            const reverseNeighborPair: [[number, number], [number, number]] = [[currentEdge.rSite.x, currentEdge.rSite.y], [currentEdge.lSite.x, currentEdge.lSite.y]];
            if (!neighbors.includes(neighborPair) && !neighbors.includes(reverseNeighborPair)) {
                neighbors.push(neighborPair);
            }
        }
    }


    return neighbors;


}

export function drawGraph(canvas : HTMLCanvasElement, sites: {x: number;y: number; id: string}[], neighbors: Array<[[number, number], [number, number]]>) {

    const context = canvas.getContext('2d');
    context!.clearRect(0, 0, canvas.width, canvas.height);


    for (let i = 0; i < sites.length; i++) {
        drawPoint(context!, sites[i].x, sites[i].y, sites[i].id, '#505050', 5);
    }

    //draw lines
    for (let i = 0; i < neighbors.length; i++) {
        const n1x = neighbors[i][0][0];
        const n1y = neighbors[i][0][1];
        const n2x = neighbors[i][1][0];
        const n2y = neighbors[i][1][1];
        drawLine(context!, [n1x, n1y], [n2x, n2y], '#505050', 1);
    }
}

//adapted from: https://dirask.com/posts/JavaScript-how-to-draw-point-on-canvas-element-PpOBLD
function drawPoint(context: CanvasRenderingContext2D, x: number, y: number, label: string, color: string, size: number) {
    if (color == null) {
        color = '#000';
    }
    if (size == null) {
        size = 5;
    }

    // to increase smoothing for numbers with decimal part
    const pointX = Math.round(x);
    const pointY = Math.round(y);

    context.beginPath();
    context.fillStyle = color;
    context.arc(pointX, pointY, size, 0 * Math.PI, 2 * Math.PI);
    context.fill();

    if (label) {
        const textX = pointX;
        const textY = Math.round(pointY - size - 3);

        context.font = 'Italic 14px Arial';
        context.fillStyle = color;
        context.textAlign = 'center';
        context.fillText(label, textX, textY);
    }
}

//adapted from: https://www.javascripttutorial.net/web-apis/javascript-draw-line/
function drawLine(ctx: CanvasRenderingContext2D, begin: [number, number], end: [number, number], stroke: string, width: number) {
    if (stroke) {
        ctx.strokeStyle = stroke;
    }

    if (width) {
        ctx.lineWidth = width;
    }

    ctx.beginPath();
    ctx.moveTo(...begin);
    ctx.lineTo(...end);
    ctx.stroke();
}