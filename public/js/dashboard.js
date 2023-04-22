// Dashboard javascript
// loads user, standard logged-in dashboard, and bins.




// get a single bin by id
async function getBin(binid){
    $.ajax({
        type: 'GET',
        url: '/api/bin',
        data: {binid: binid}, // request specific bin id
        success: function(response) { 
            // create new item for dashboard UI
            new_item = document.createElement("div");
            new_item.classList.add("box");
            item_name = document.createElement("span"); // item name
            item_name.classList.add("bin_name");
            item_name.innerHTML = response.name;
            new_item.appendChild(item_name);
            item_id = document.createElement("span"); // item id
            item_id.classList.add("bin_id");
            item_id.innerHTML = response.id;
            new_item.appendChild(item_id);

            new_item.onclick = function() { window.location.href = "/bin?id=" + response.id; };
            
            document.getElementById("grid").appendChild(new_item); // add to grid
        },
        error: function(xhr, status, err) {
            console.error('DATA: XHR Error.');
        }
    });
}
// create a single bin
async function putBin(){
    $.ajax({
        type: 'PUT',
        url: '/api/bin',
        success: function(response) { 
            console.log(response); // returns bin ID
            getUserProfile();
        },
        error: function(xhr, status, err) {
            console.error('DATA: XHR Error.');
        }
    });
}

// Get Logged in User information from server
async function getUserProfile() {
    const c = document.getElementById("page-content");
    c.innerHTML = `
        <div id='grid' class="wrapper">
            <div class="box" onclick='putBin()'>
                <span class="bin_name">Create New</span>
            </div>
        </div>
    `;

    $.ajax({ // api request using built in user data
        type: 'GET',
        url: '/api/user',
        success: function(user) { 
            document.getElementById("username").innerHTML = user.name; // user return data to modify UI
            for (x=0;x<user.bins.length;x++){
                getBin(user.bins[x]); // iterate over bins and GET each one to be displayed
            }
        },
        error: function(xhr, status, err) {
            console.error('DATA: XHR Error.');
        }
    });
}

$(document).ready(function() { 
    getUserProfile(); // Load user profile when page loads.
});
