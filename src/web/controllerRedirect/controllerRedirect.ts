requestControllerID();

async function requestControllerID() {
    const response = await fetch('/catcaster/controller/', {
        method : 'POST',
        headers : {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: ''
    });

    if (response.ok) {
        const id = await response.json();
        window.location.href = '/catcaster/controller/'+id;
    }
}
