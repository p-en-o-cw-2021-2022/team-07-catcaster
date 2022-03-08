requestID();

async function requestID(){
    let response = await fetch("/catcaster/screen/", {
        method : 'POST',
        headers : {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: ''
    });

    if (response.ok) {
        let id = await response.json();
        window.location.href = '/catcaster/screen/'+id;
    };
};


