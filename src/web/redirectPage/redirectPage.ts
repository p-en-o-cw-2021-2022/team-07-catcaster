
void requestScreenID();

async function requestScreenID() {
    const response = await fetch('/catcaster/screen/', {
        method : 'POST',
        headers : {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: ''
    });

    if (response.ok) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const id: string = await response.json();
        window.location.href = '/catcaster/screen/?id=' + id;
    }
}


