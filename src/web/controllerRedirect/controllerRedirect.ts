requestControllerID();

async function requestControllerID(){
    let response = await fetch("/catcaster/controller/", {
        method : 'POST',
        headers : {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: ''
    });

    if (response.ok) {
        let id = await response.json();
        window.location.href = '/catcaster/controller/?id='+id;
    };
};
