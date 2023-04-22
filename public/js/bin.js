var CURRENT_BIN = null;
var CURRENT_PAGE = 0;
var UNSAVED = false;

var MAX_ROW = 7;
var MIN_ROW = 2;
var MAX_COL = 12;
var MIN_COL = 2;

// =============== HTML Rendering ================
async function render(layout){
    
    // modify page content for bin
    const c = document.getElementById("page-content");
    c.innerHTML = "";
    let toolbar = document.createElement("div");
    toolbar.classList.add("toolbar");

    const date = new Date(layout.editDates[layout.editDates.length - 1])
    var dateStr =
    ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
    ("00" + date.getDate()).slice(-2) + "/" +
    date.getFullYear() + " " +
    ("00" + date.getHours()).slice(-2) + ":" +
    ("00" + date.getMinutes()).slice(-2) + ":" +
    ("00" + date.getSeconds()).slice(-2);

    // ==== create top bar
    toolbar.innerHTML = `
        </div>
            <input type="text" onchange="editName(this.value)" id="binname" name="binname" value="${layout.name}">
            <span id="binid"><strong>Grid:</strong> ${layout.row} x ${layout.col}, <strong>ID:</strong> ${layout.id}</span>
            <span id="info1"><strong>Last edit:</strong> ${dateStr}</span>
            <div id=buttons>
            <button type="button" class="barbutton btn btn-default btn-lg">
                <i class="bi bi-gear">  </i>
            </button>
            <button type="button" class="barbutton btn btn-default btn-lg">
                <i class="bi bi-pencil">  </i>
            </button>

            <label for="bincol">Columns:</label>
            <input type="number" onchange="editDim(this.value, ${layout.row})" id="bincol" name="bincol" min="2" max="16" value="${layout.col}">

            <label for="binrow">Rows:</label>
            <input type="number" onchange="editDim(${layout.col},this.value)" id="binrow" name="binrow" min="2" max="10" value="${layout.row}">
        </div>
    `;
    c.appendChild(toolbar);

    // ==== GRID
    gridCol = [];
    gridRow = [];
    for (x=0;x<layout.col;x++){
        gridCol.push( (100 / layout.col).toString() + "%" )
    }
    for (x=0;x<layout.row;x++){
        gridRow.push( (100 / layout.row).toString() + "%" )
    }
    let g_elem = `
    <div id="gridPos">
        <div id='grid' style="grid-template-columns: ${gridCol.join(" ")}; grid-template-rows: ${gridRow.join(" ")};"class="wrapper">
    `;

    let page = layout.items[CURRENT_PAGE];
    
    for (row=1; row <= layout.row; row++){
        for (col=1; col <= layout.col; col++){
        
            console.log(`CREATE GRID ITEM col:${col}, row:${row}`);
            let current_item = null;
            
            for (j=0; j < page.length; j++){
                if (page[j].y == row && page[j].x == col){
                    current_item = page[j];

                }
            }
            if (current_item){
                console.log("CREATE PREEXISTING ITEM");
                g_elem += `
                <div class="box" style='grid-row: ${current_item.y}/${current_item.y + current_item.height}; grid-column: ${current_item.x}/${current_item.x + current_item.width};'>
                    <span class="bin_name">${current_item.id}</span>
                </div>
                `;
            } 
            else{
                let blocked = false;
                for (j=0; j < page.length; j++){
                    console.log(page[j].y,page[j].y + page[j].height);
                    console.log(page[j].x,page[j].x + page[j].width);
                    if (page[j].y <= row && page[j].y + page[j].height > row &&
                        page[j].x <= col && page[j].x + page[j].width > col){
                            blocked = true;
                            console.log('blocked square')
    
                    }
                }

                if (!blocked){
                    console.log("CREATE EMPTY ITEM");
                    g_elem += `
                    <div class="box empty">
                        <span onclick="createItem(${row},${col})" class="bin_name">+</span>
                    </div>
                    `;
                }
            }

        
        }
    }
    g_elem += "</div></div>";
    c.innerHTML += g_elem;

    document.getElementById("binname").addEventListener("focusout", (event) => {
        editName(document.getElementById("binname").textContent);
    });

    new Swappable.default(document.getElementById("grid"), {
        draggable: '.box'
    }).on('swappable:start', () => console.log('swappable:start'))
    .on('swappable:swapped', () => console.log('swappable:swapped'))
    .on('swappable:stop', () => console.log('swappable:stop'));

    c.innerHTML +=`
        <div id='save-button' onclick="saveEdits()">
            <i class="bi bi-device-hdd"></i> <span>Save edits to server</span>
        </div>
    `;

    // do this last
    console.log(UNSAVED);
    if (UNSAVED == true){
        document.getElementById("save-button").style.display = "block";
    }
}
// =================== EDITING FUNCTIONS =========================

function editDim(col,row){
    console.log("local edit bin dims to " + col + ',' + row);
    CURRENT_BIN.col = col;
    CURRENT_BIN.row = row;
    UNSAVED = true;
    // update interface
    render(CURRENT_BIN);
}

function editName(name){
    console.log("local edit bin name to " + name);
    CURRENT_BIN.name = name;
    UNSAVED = true;
    // update interface
    render(CURRENT_BIN);
}
function editDescription(desc){
    console.log("local edit bin name to " + desc);
    CURRENT_BIN.description = desc;
    UNSAVED = true;
    // update interface
    render(CURRENT_BIN);
}

function addTags(tagList){
    console.log("local edit tags to add " + tagList);
    for (x=0;x<tagList.length; x++){
        let tag = tagList[x];
        if (!CURRENT_BIN.tags.includes(tag)){
            if (CURRENT_BIN.tags.length < 10){
                CURRENT_BIN.tags.push(tag);
                UNSAVED = true;
            }else{
                console.log("tags full!");
            }
        }
    }
    render(CURRENT_BIN);
}
function addTag(tag){
    console.log("local edit tags to remove " + tag);
    for (x=0;x<CURRENT_BIN.tags.length; x++){
        if (CURRENT_BIN.tags[x] == tag){
            CURRENT_BIN.tags.splice(x, 1);
            UNSAVED = true;
        }
    }
    render(CURRENT_BIN);
}



// =================== REQUEST FUNCTIONS =========================
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
async function createItem(row, col){
    console.log(`create bin ${row}, ${col}`)
    saveEdits()
    jQuery.ajax({
        url: "/api/item",
        type: "PUT",
        data: { 
            "binid": CURRENT_BIN.id,
            "row": col,
            "col": row,
            "page": CURRENT_PAGE
        },
        dataType: "json",
        success: function(result) {
            console.log(result);
            getBin(CURRENT_BIN.id)
            
        }
    });
}
async function saveEdits(){
    const date = new Date();
    CURRENT_BIN.editDates.push(date);
    jQuery.ajax({
        url: "/api/bin",
        type: "POST",
        data: { 
            "name": CURRENT_BIN.name,
            "description": CURRENT_BIN.description,
            "id": CURRENT_BIN.id,
            "items": JSON.stringify(CURRENT_BIN.items),
            "tags": JSON.stringify(CURRENT_BIN.tags),
            "col": CURRENT_BIN.col,
            "row": CURRENT_BIN.row,
            "editDates": JSON.stringify(CURRENT_BIN.editDates),
            "editors": JSON.stringify(CURRENT_BIN.editors),
            "owner": CURRENT_BIN.owner
        },
        dataType: "json",
        success: function(result) {
            console.log(result);
            
        }
    });  
    UNSAVED = false;
    render(CURRENT_BIN);  
}

async function getBin(binid){
    $.ajax({
        type: 'GET',
        url: '/api/bin',
        data: {binid: binid}, // request specific bin id
        success: function(response) { 
            console.log(response);
            render(response);
            CURRENT_BIN = response;
        },
        error: function(xhr, status, err) {
            console.error('DATA: XHR Error.');
        }
    });
}




// ==================== ON DOC LOAD ======================
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