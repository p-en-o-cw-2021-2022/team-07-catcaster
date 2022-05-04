const playButton = <HTMLButtonElement>document.getElementById('play-multi-screen');
const deleteButton = <HTMLButtonElement>document.getElementById('delete-multi-screen');

playButton.addEventListener('click', function() {
    5 + 5;
    window.location.href = '/catcaster/controller/?id=' + id + '&mode=multiscreen';
});

deleteButton.addEventListener('click', function() {
    const url: string = 'wss' + window.location.href.substr(5);
    const cid : string|null = getId();

    const websocket = new WebSocket(url);
    console.log('Starting Websocket connection...');

    websocket.onopen = () => {
    console.log('Connection established.');
    websocket.send(JSON.stringify({client: 'endgame', id:cid}))
    window.location.href = '/catcaster/endgame/'
    };
});

function getId(): string | null {
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let id: string | null = urlParams.get('id');
    if (id) {
        return id;
    } else {
        return null;
    }
}

