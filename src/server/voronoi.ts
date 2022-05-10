/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import Voronoi from 'voronoi';

export function findNeighborsVoronoi(sites: {x: number; y: number; id: string}[]) {

    const voronoi = new Voronoi();
    const bbox = {xl: 0, xr: 8000, yt: 0, yb: 6000}; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom

    const diagram = voronoi.compute(sites, bbox);

    const neighbors: Array<[[number, number], [number, number]]> = [];

    for (const currentEdge of diagram.edges) {
        if (currentEdge.lSite !== null && currentEdge.rSite !== null) {
            const neighborPair: [[number, number], [number, number]] = [[currentEdge.lSite.x, currentEdge.lSite.y], [currentEdge.rSite.x, currentEdge.rSite.y]];
            const reverseNeighborPair: [[number, number], [number, number]] = [[currentEdge.rSite.x, currentEdge.rSite.y], [currentEdge.lSite.x, currentEdge.lSite.y]];
            if (!neighbors.includes(neighborPair) && !neighbors.includes(reverseNeighborPair)) {
                neighbors.push(neighborPair);
            }
        }
    }
    const neighbors_ids: Array<[string, string]> = [];

    for (const neighbor of neighbors) {
        let left_id: string;
        let right_id: string;
        left_id = '';
        right_id = '';
        for (const site of sites) {
            if ((site.x === neighbor[0][0]) && (site.y === neighbor[0][1])) {
                left_id = site.id;
            }
            if ((site.x === neighbor[1][0]) && (site.y === neighbor[1][1])) {
                right_id = site.id;
            }
        }
        const pair_ids: [string, string] = [left_id, right_id];
        neighbors_ids.push(pair_ids);
    }

    const neighborsPerId: {id:string; neighborsOfID: string[]}[] = [];
    for (const site of sites) {
        const neighborsOfID: string[] = [];
        for (const pair of neighbors_ids) {
            if (pair[0] === site.id) {
                neighborsOfID.push(pair[1]);
            } else if (pair[1] === site.id) {
                neighborsOfID.push(pair[0]);
            }
        }
        const id = site.id;
        const neighborsId = {id, neighborsOfID};
        neighborsPerId.push(neighborsId);
    }

    return neighborsPerId;
}

export function drawGraph(canvas : HTMLCanvasElement, sites: {x: number;y: number; id: string}[], neighbors: Array<[[number, number], [number, number]]>) {

    const context = canvas.getContext('2d');
    if (context === null) {
        throw new Error('canvas context was null');
    }
    context.clearRect(0, 0, canvas.width, canvas.height);


    for (const site of sites) {
        drawPoint(context, site.x, site.y, site.id, '#505050', 5);
    }

    //draw lines
    for (const neighbor of neighbors) {
        const n1x = neighbor[0][0];
        const n1y = neighbor[0][1];
        const n2x = neighbor[1][0];
        const n2y = neighbor[1][1];
        drawLine(context, [n1x, n1y], [n2x, n2y], '#505050', 1);
    }
}

//adapted from: https://dirask.com/posts/JavaScript-how-to-draw-point-on-canvas-element-PpOBLD
function drawPoint(context: CanvasRenderingContext2D, x: number, y: number, label: string, color: string, size: number) {
    if (color === null) {
        color = '#000';
    }
    if (size === null) {
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