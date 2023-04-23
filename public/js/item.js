CURRENT_ITEM = null;
CURRENT_BIN_ID = null;
var UNSAVED = false;

async function render(item,binid){
    const c = document.getElementById("page-content");
    c.innerHTML = `
        <div id="toolbar">
            <a href='/bin?id=${binid}'>Test</a> -> <input type="text" id="itemname" name="itemname" value="${item.name}">
        </div>
        <div id="left_content">
            <button onclick="editImage();">Edit Image</button>
            <img src="${item.image}" id="item_img">
        </div>
        <div id="right_content">
            <div id="item_description">${item.description}</div>
        </div>
    `
}

function editImage(){
    let new_img = prompt('Change the item image (paste a URL)');
    CURRENT_ITEM.image = new_img;
    UNSAVED = true;
    render(CURRENT_ITEM, CURRENT_BIN_ID);
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

async function getItem(itemid,binid){
    $.ajax({
        type: 'GET',
        url: '/api/item',
        data: {itemid: itemid}, // request specific item id
        success: function(response) { 
            console.log(response);
            render(response,binid);
            CURRENT_ITEM = response;
            CURRENT_BIN_ID = binid;
            
        },
        error: function(xhr, status, err) {
            console.error('DATA: XHR Error.');
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

    getItem(itemid, binid);
});