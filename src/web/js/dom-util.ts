// Set the innerText of a DOM element with given id to the given text.
export function setInnerText(id: string, text: string | number | boolean | null | undefined) {
    const el = document.getElementById(id);
    if(el) el.innerText = text !== null && text !== undefined ? text.toString() : '';
}

// Set a DOM element's hidden state.
export function setHidden(id: string, hidden: boolean) {
    const el = document.getElementById(id);
    if(el) el.hidden = hidden;
}

// Draw a line on canvas
export function drawLine(context: CanvasRenderingContext2D, from: number[], to: number[], color: string = 'black') {
    context.beginPath();
    context.moveTo(from[0], from[1]);
    context.lineTo(to[0], to[1]);
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.stroke();
}

// Scales the given array with the given scale number
export function scaleArray(array: number[], yScale:number) {

    const result: number[] = [];
    for (let i = 0; i < array.length; i++) {
        result[i] = array[i] * yScale;
    }
    return result;
}

// Draws graph on canvas with scaled array(with the max data element) which stores y axis values
export function drawGraph(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, scaledDataArray: number[]) {

    let left = 0;
    let prev_stat = scaledDataArray[0];
    const move_left_by = (canvas.width) / scaledDataArray.length;

    for(let i = 1; i < scaledDataArray.length; i++) {
        drawLine(context, [left, prev_stat], [left+move_left_by, scaledDataArray[i]], 'black');
        prev_stat = scaledDataArray[i];
        left += move_left_by;
    }
}

// Fills canvas white
export function clearCanvas(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
}