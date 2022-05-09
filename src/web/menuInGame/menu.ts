const playButton = <HTMLButtonElement>document.getElementById('play-multi-screen');
const deleteButton = <HTMLButtonElement>document.getElementById('delete-multi-screen');

const url: string = 'wss' + window.location.href.substr(5);
const websocket = new WebSocket(url);
console.log('Starting Websocket connection...');

websocket.onopen = () => {
    console.log('Connection established.');
};

playButton.addEventListener('click', function() {
    const cid : string|null = getId();
    websocket.send(JSON.stringify({client: 'join', id:cid}));
    window.location.href = '/catcaster/controller/?id=' + cid! + '&mode=multiscreen';
});

deleteButton.addEventListener('click', function() {
    const cid : string|null = getId();
    websocket.send(JSON.stringify({client: 'endgame', id:cid}));
    window.location.href = '/catcaster/endgame/';
});

function getId(): string | null {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id: string | null = urlParams.get('id');
    if (id) {
        return id;
    } else {
        return null;
    }
}

