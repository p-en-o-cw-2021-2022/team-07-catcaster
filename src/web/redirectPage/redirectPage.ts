requestScreenID();

async function requestScreenID() {
    const response = await fetch('/catcaster/screen/', {
        method : 'POST',
        headers : {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: ''
    });

    if (response.ok) {
        const id = await response.json();
        window.location.href = '/catcaster/screen/?id='+id;
    }
}


