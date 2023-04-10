var CURRENT_BIN = null;
var UNSAVED = false;

var MAX_ROW = 7;
var MIN_ROW = 2;
var MAX_COL = 12;
var MIN_COL = 2;

// Get Logged in User information from server
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

async function saveEdits(){
    let post = JSON.stringify(CURRENT_BIN);

    let xhr = new XMLHttpRequest()
    xhr.open('POST', "/bin", true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
    xhr.send(post);
}

async function getBin(binid){
    $.ajax({
        type: 'GET',
        url: '/api/bin',
        data: {binid: binid}, // request specific bin id
        success: function(response) { 
            console.log(response);
            CURRENT_BIN = response;

            // modify page content for bin
            const c = document.getElementById("page-content");
            let toolbar = document.createElement("div");
            toolbar.classList.add("toolbar");

            const date = new Date(CURRENT_BIN.editDates[CURRENT_BIN.editDates.length - 1])
            var dateStr =
            ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
            ("00" + date.getDate()).slice(-2) + "/" +
            date.getFullYear() + " " +
            ("00" + date.getHours()).slice(-2) + ":" +
            ("00" + date.getMinutes()).slice(-2) + ":" +
            ("00" + date.getSeconds()).slice(-2);

            // text
            toolbar.innerHTML = `
                <span id="binname" class="input" role="textbox" contenteditable>${CURRENT_BIN.name}</span>
                <span id="binid"><strong>Grid:</strong> ${CURRENT_BIN.row} x ${CURRENT_BIN.col}, <strong>ID:</strong> ${CURRENT_BIN.id}</span>
                <span id="info1"><strong>Last edit:</strong> ${dateStr}</span>
                <div id=buttons>
                <button type="button" class="barbutton btn btn-default btn-lg">
                    <i class="bi bi-gear">  </i>
                </button>
                <button type="button" class="barbutton btn btn-default btn-lg">
                    <i class="bi bi-pencil">  </i>
                </button>
                </div>
            `;
            c.appendChild(toolbar);

            // ==== GRID
            let g_elem = `
            <div id="gridPos">
                <div id='grid' class="wrapper">
            `;
            for (x=0;x< CURRENT_BIN.col * CURRENT_BIN.row; x++){
                g_elem += `
                    <div class="box">
                        <span class="bin_name">${x}</span>
                    </div>
                `;
            }
            g_elem += "</div></div>";
            c.innerHTML += g_elem;
            document.getElementById("binname").addEventListener("focusout", (event) => {
                CURRENT_BIN.name = document.getElementById("binname").textContent;
                UNSAVED = true;
                console.log(CURRENT_BIN);
            });

            new Swappable.default(document.getElementById("grid"), {
                draggable: '.box'
            }).on('swappable:start', () => console.log('swappable:start'))
            .on('swappable:swapped', () => console.log('swappable:swapped'))
            .on('swappable:stop', () => console.log('swappable:stop'));
        },
        error: function(xhr, status, err) {
            console.error('DATA: XHR Error.');
        }
    });
}

$(document).ready(async function() { 
    getUserProfile(); // Load user profile when page loads.

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    await getBin(urlParams.get('id'));
});

let el = document.querySelector(".input-wrap .input");
let widthMachine = document.querySelector(".input-wrap .width-machine");
el.addEventListener("keyup", () => {
  widthMachine.innerHTML = el.value;
});

// Dealing with Textarea Height
function calcHeight(value) {
  let numberOfLineBreaks = (value.match(/\n/g) || []).length;
  // min-height + lines x line-height + padding + border
  let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2;
  return newHeight;
}

let textarea = document.querySelector(".resize-ta");
textarea.addEventListener("keyup", () => {
  textarea.style.height = calcHeight(textarea.value) + "px";
});