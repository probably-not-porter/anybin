// Dashboard javascript
// loads user, standard logged-in dashboard, and bins.

// =================== REQUEST FUNCTIONS =========================
async function getBin(binid){
    $.ajax({
        type: 'GET',
        url: '/api/bin',
        data: {binid: binid}, // request specific bin id
        success: function(response) { 
            // create new item for dashboard UI
            let pages = 0;
            let items = 0
            for (x=0; x < response.items.length; x++){
                pages = pages + 1;
                items = items + response.items[x].length;
            }

            const Duration = (difference) => {
                let secondsInMiliseconds    = 1000, 
                    minutesInMiliseconds    = 60 * secondsInMiliseconds,
                    hoursInMiliseconds      = 60 * minutesInMiliseconds,
                    daysInMiliseconds       = 24 * hoursInMiliseconds;
            
                var  differenceInDays       = difference / daysInMiliseconds,
                     differenceInHours      = differenceInDays     % 1 * 24,
                     differenceInMinutes    = differenceInHours     % 1 * 60,
                     differenceInSeconds    = differenceInMinutes   % 1 * 60;
                return {
                    "days"    : Math.floor(differenceInDays),
                    "hours"   : Math.floor(differenceInHours),
                    "minutes" : Math.floor(differenceInMinutes),
                    "seconds" : Math.floor(differenceInSeconds)
                }
            }
            let aLittleWhileAgo = new Date(response.editDates[response.editDates.length - 1])
            let now = new Date();
            let lastEdit = Duration(now-aLittleWhileAgo);
            let editString = "";
            if (lastEdit["days"] != 0){
                editString = `${lastEdit["days"]} day`;
                if (lastEdit["days"] !=1) { editString += "s"}
            }
            else if (lastEdit["hours"] != 0){
                editString = `${lastEdit["hours"]} hour`;
                if (lastEdit["hours"] !=1) { editString += "s"}
            }
            else if (lastEdit["minutes"] != 0){
                editString = `${lastEdit["minutes"]} minute`;
                if (lastEdit["minutes"] !=1) { editString += "s"}
            }
            else if (lastEdit["seconds"] != 0){
                editString = `${lastEdit["seconds"]} second`;
                if (lastEdit["seconds"] !=1) { editString += "s"}
            }


            let new_item = `
                <div class='box'>
                    <button style='float: right;' id="save-button" type="button" onclick='delBin("${response.id}")' class="barbutton btn btn-default btn-lg">
                        <i style='font-size: 20px;' class="bi bi-trash"></i>
                    </button>
                    <div style='width: 100%; height: 100%;'onclick='window.location.href = "/bin?id=" + "${response.id}";'>
                        <span class='bin_name'>${response.name}</span>
                        <br>
                        <span style='font-size: 12px;'><i class="bi bi-file-earmark"></i> ${pages}  <i class="bi bi-gem"></i> ${items}</span>
                        <span style='position: absolute; color: rgba(255,255,255,0.3); font-size: 10px; bottom: 0px; left: 10px;'>Edited ${editString} ago</span>

                    </div>
                </div>
            `
            
            document.getElementById("grid").innerHTML += new_item; // add to grid
        },
        error: function(xhr, status, err) {
            console.error('DATA: XHR Error.');
        }
    });
}
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
async function delBin(binid){
    if (confirm("Are you sure you want to delete this?") == true) {
        $.ajax({
            type: 'DELETE',
            url: '/api/bin',
            data: {binid: binid}, // request specific bin id
            success: function(response) { 
                console.log(response);
            },
            error: function(xhr, status, err) {
                console.error('DATA: XHR Error.');
            }
        });
        getUserProfile()
    } else {
        console.log("CANCEL DELETE")
    }
    
}
async function getUserProfile() {
    const c = document.getElementById("page-content");
    c.innerHTML = `
        <div id='grid' class="wrapper">
            
        </div>
        <div class="create-button" onclick='putBin()'>+</div>
        <div class="create-flag">Create New</div>
    `;

    $.ajax({ // api request using built in user data
        type: 'GET',
        url: '/api/user',
        success: function(user) { 
            console.log(user);
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

// ==================== ON DOC LOAD ======================
$(document).ready(function() { 
    console.info("LOAD DASHBOARD PAGE");
    getUserProfile(); // Load user profile when page loads.
});
