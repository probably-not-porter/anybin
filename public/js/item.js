CURRENT_ITEM = null;
CURRENT_BIN = null;
var UNSAVED = false;

async function render(item){
    const c = document.getElementById("page-content");
    c.innerHTML = `
        <div id="toolbar">
            <a href='/bin?id=${CURRENT_BIN.id}'>${CURRENT_BIN.name}</a> / <input onchange="editName(this.value)" type="text" id="itemname" name="itemname" value="${item.name}">
        </div>
        <div id="left_content">
            <button onclick="editImage();">Replace Image (URL)</button>
            <input type="file" id="img_uploader" name="img" accept="image/*" onchange="editImageStore();"></input>
            <img src="${item.image}" id="item_img">
        </div>
        <div id="right_content">
            <div id="item_description">${item.description}</div>
        </div>
    `
}

function editImage(){
    let new_img = prompt('Change the item image (paste a URL)');
    if (new_img){
        CURRENT_ITEM.image = new_img;
        saveEdits();
        render(CURRENT_ITEM, CURRENT_BIN.id);
    }
}
function editImageStore(){
    console.log("attempt image upload");


    const formData = new FormData();
    const imageFile = document.querySelector('#img_uploader').files[0];

    formData.append('image', imageFile);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/image', true);

    xhr.onload = function () {
        if (this.status === 200) {
            console.info('UPLOAD STATUS: ', this.statusText);
            console.info("UPLOADED: " + this.responseText);
            CURRENT_ITEM.image = this.responseText;
            saveEdits();
            render(CURRENT_ITEM, CURRENT_BIN.id);
        } else {
            console.info('UPLOAD STATUS: ', this.statusText);
        }
    };
    xhr.send(formData);
}


function editName(n){
    CURRENT_ITEM.name = n;
    saveEdits();
    render(CURRENT_ITEM, CURRENT_BIN.id);
}


async function getUserProfile() {
    $.ajax({ // api request using built in user data
        type: 'GET',
        url: '/api/user',
        success: function(user) { 
            document.getElementById("username").innerHTML = user.name; // user return data to modify UI
        },
        error: function(xhr, status, err) {
            console.error('DATA: XHR Error.');
        }
    });
}

async function getItem(itemid){
    $.ajax({
        type: 'GET',
        url: '/api/item',
        data: {itemid: itemid}, // request specific item id
        success: function(response) { 
            console.log(response);
            render(response);
            CURRENT_ITEM = response;
        },
        error: function(xhr, status, err) {
            console.error('DATA: XHR Error.');
        }
    });
}
async function getBin(binid){
    $.ajax({
        type: 'GET',
        url: '/api/bin',
        data: {binid: binid}, // request specific bin id
        success: function(response) { 
            CURRENT_BIN = response;
            render(CURRENT_ITEM);
            
        },
        error: function(xhr, status, err) {
            console.error('DATA: XHR Error.');
        }
    });
}

async function saveEdits(){
    console.log(CURRENT_ITEM);
    jQuery.ajax({
        url: "/api/item",
        type: "POST",
        data: {
                "name": CURRENT_ITEM.name,
                "id": CURRENT_ITEM.id,
                "description": CURRENT_ITEM.description,
                "links": JSON.stringify(CURRENT_ITEM.links),
                "image": CURRENT_ITEM.image
            },
        dataType: "json",
        success: function(result) {
            console.log(result);
            
        }
    });   
}


    

$(document).ready(async function() { 
    console.info("LOAD ITEM PAGE");
    getUserProfile(); // Load user profile when page loads.

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const itemid = urlParams.get('id');
    const binid = urlParams.get('bin');

    getItem(itemid);
    getBin(binid);
});