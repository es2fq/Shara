var map;
var id = null, markers = {}, blueMarkers = [];
var infoBox = null;
var infoWindows = [];
var mapStyle = [{ "featureType": "all", "elementType": "all", "stylers": [{ "hue": "#ff0000" }, { "saturation": -100 }, { "lightness": -30 }] }, { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#ffffff" }] }, { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{ "color": "#353535" }] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#656565" }] }, { "featureType": "poi", "elementType": "geometry.fill", "stylers": [{ "color": "#505050" }] }, { "featureType": "poi", "elementType": "geometry.stroke", "stylers": [{ "color": "#808080" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#454545" }] }, { "featureType": "transit", "elementType": "labels", "stylers": [{ "hue": "#000000" }, { "saturation": 100 }, { "lightness": -40 }, { "invert_lightness": true }, { "gamma": 1.5 }] }];
var sessionUser = "~";

function initMap() {
    defaultPos = { lat: 38.8899, lng: -77.009 };
    map = new google.maps.Map(document.getElementById('content'), {
        center: defaultPos,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 16,
        styles: mapStyle
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            map.setCenter(pos);

            defaultPos = pos;
            createMarkerWithStoryButton(map, pos);
        });
    }
    createMarkerWithStoryButton(map, defaultPos);

    google.maps.event.addListener(map, "click", function (event) {
        infoBox.close();
        for (i = 0; i < infoWindows.length; i++)
            infoWindows[i].close();
    });

    google.maps.event.addListener(map, "rightclick", function (event) {
        var pos = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        };

        createMarkerWithStoryButton(map, pos);
    })

    // Create the search box and link it to the UI element.
    var input = document.getElementById('searchBox');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }
        
        // Clear out the old markers.
        markers.forEach(function (marker) {
            marker.setMap(null);
        });
        markers = [];

        if (places.length == 1) {
            var pos = places[0].geometry.location;

            createMarkerWithStoryButton(map, pos);
            map.setCenter(pos);

            return;
        }

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}

function createMarkerWithStoryButton(map, pos)
{
    if (markers[id] != null) deleteMarker(id);
    if (infoBox != null)
    {
        google.maps.event.clearInstanceListeners(infoBox);
        infoBox.close();
        infoBox = null;
    }

    var iconBase = 'img/map-marker.png';

    var marker = new google.maps.Marker({
        draggable: true,
        position: pos,
        map: map,
        icon: iconBase
    });

    id = marker.__gm_id;
    markers[id] = marker;

    var contentString = '<button id="openButton" onclick="openStoryWindow();">Create Story</button>'

    infoBox = new google.maps.InfoWindow({
        content: contentString,
    });

    /*
     * The google.maps.event.addListener() event waits for
     * the creation of the infowindow HTML structure 'domready'
     * and before the opening of the infowindow defined styles
     * are applied.
     */
    google.maps.event.addListener(infoBox, 'domready', function () {

        // Reference to the DIV which receives the contents of the infowindow using jQuery
        var iwOuter = $('.gm-style-iw');

        // Set text to center
        iwOuter.css({ 'text-align': 'center' });

        /* The DIV we want to change is above the .gm-style-iw DIV.
         * So, we use jQuery and create a iwBackground variable,
         * and took advantage of the existing reference to .gm-style-iw for the previous DIV with .prev().
         */
        var iwBackground = iwOuter.prev();

        // Remove the background shadow DIV
        iwBackground.children(':nth-child(2)').css({ 'display': 'none' });

        // Remove tail shadow
        iwBackground.children(':nth-child(1)').attr('style', function (i, s) { return s + 'display: none !important;' });
                        
        // Taking advantage of the already established reference to
        // div .gm-style-iw with iwOuter variable.
        // You must set a new variable iwCloseBtn.
        // Using the .next() method of JQuery you reference the following div to .gm-style-iw.
        // Is this div that groups the close button elements.
        var iwCloseBtn = iwOuter.next();

        // Apply the desired effect to the close button
        iwCloseBtn.css({
            display: 'none',
        });
    });

    marker.addListener('click', function () {
        closeBlueMarkerWindows();
        infoBox.open(map, marker);
    });

    infoBox.open(map, marker);
}

function createBlueMarker(user, map, pos, title, desc, time, votes, userUpvotes) {
    desc = desc.split("\\n").join("<br />");

    var iconBase = 'img/map-marker2.png';

    if (sessionUser == user)
        iconBase = 'img/map-marker3.png';

    var marker = new google.maps.Marker({
        draggable: false,
        position: pos,
        map: map,
        icon: iconBase
    });

    blueMarkers.push(marker);

    var onclick = 'onclick="handleUpvote(this)"';
    var markerStyle = '';

    var usersThatUpvoted = userUpvotes.split(",");
    if (usersThatUpvoted.indexOf(sessionUser) > -1)
    {
        onclick = 'onclick=""';
        markerStyle = 'style="opacity:0.7;"';
    }

    var contentString =
        '<div id="blueMarker">' +
            '<div id="blueMarkerTime">' + time + '</div>' +
            '<div id="title">' + title + '</div>' +
            '<div id="desc">' + desc + '</div>' +
            '<div id="votes">' +
                '<div id="vote">Popularity - ' + votes + '</div>' +
                '<img id="upvote" ' + onclick + ' ' + markerStyle + ' src="img/upvote.jpg" />' +
            '</div>' +
        '</div>';

    var infoWindow = new google.maps.InfoWindow({
        content: contentString,
    });
    infoWindows.push(infoWindow);

    /*
     * The google.maps.event.addListener() event waits for
     * the creation of the infowindow HTML structure 'domready'
     * and before the opening of the infowindow defined styles
     * are applied.
     */
    google.maps.event.addListener(infoWindow, 'domready', function () {

        // Reference to the DIV which receives the contents of the infowindow using jQuery
        var iwOuter = $('.gm-style-iw');

        // Set text to center
        iwOuter.css({ 'text-align': 'center' });

        /* The DIV we want to change is above the .gm-style-iw DIV.
         * So, we use jQuery and create a iwBackground variable,
         * and took advantage of the existing reference to .gm-style-iw for the previous DIV with .prev().
         */
        var iwBackground = iwOuter.prev();

        // Remove the background shadow DIV
        iwBackground.children(':nth-child(2)').css({ 'display': 'none' });

        // Remove tail shadow
        iwBackground.children(':nth-child(1)').attr('style', function (i, s) { return s + 'display: none !important;' });

        // Taking advantage of the already established reference to
        // div .gm-style-iw with iwOuter variable.
        // You must set a new variable iwCloseBtn.
        // Using the .next() method of JQuery you reference the following div to .gm-style-iw.
        // Is this div that groups the close button elements.
        var iwCloseBtn = iwOuter.next();

        // Apply the desired effect to the close button
        iwCloseBtn.css({
            display: 'none'
        });
    });

    marker.addListener('click', function () {
        if (isInfoWindowOpen(infoBox))
            infoBox.close();
        closeBlueMarkerWindows();
        infoWindow.open(map, marker);
    });
}

function handleUpvote(elem) {
    if (sessionUser == "~")
    {
        alertify.dialog('alert').set({
            message: 'You must be signed in to upvote!',
            title: "NOT SIGNED IN",
            transition: 'pulse',
        }).show();
        return;
    }

    elem.style.opacity = 0.7;
    elem.onclick = "";

    var voteString = elem.previousSibling;
    var votes = parseInt(voteString.innerHTML.replace(/^\D+/g, ''));
    voteString.innerHTML = "Popularity - " + (votes + 1);

    var time = elem.parentElement.previousSibling.previousSibling.previousSibling.innerHTML;

    var url = "upvote.php";
    $.ajax({
        url: url,
        type: 'POST',
        data: {
            user: sessionUser,
            time: time
        },
        success: function () {

        },
        error: function (xhr, ajaxOptions, thrownError) {
            alertify.dialog('alert').set({
                message: 'Please try again!',
                title: "Error",
                transition: 'fade',
            }).show();
        }
    });
}

function handleLogin() {
    alertify.dialog('prompt').set({
        message: 'Username (min. 3 characters)',
        title: "SIGN IN",
        transition: 'fade',
        type: 'text',
        value: '',
        onok: function (evt, value) {
            if (value.length < 3)
            {
                alertify.dialog('alert').set({
                    message: 'Username must be at least 3 characters!',
                    title: "Try Again!",
                    transition: 'pulse',
                }).show();
                return;
            }
            findUser(value);
        },
        oncancel: function (evt, value) {
            return;
        }
    }).show();
}

function findUser(username)
{
    var isUser = false;
    var password = "";

    var file = "users.txt";
    $.get(file, function (text) {
        var lines = text.split("\n");

        for (var i = 0; i < lines.length; i++)
        {
            var data = lines[i].split("/////");
            if (username.toUpperCase() == data[0].toUpperCase())
            {
                isUser = true;
                password = data[1];
                break;
            }
        }
        showPassword(isUser, username, password);
    });
}

function showPassword(isUser, username, password)
{
    if (isUser) {
        alertify.dialog('prompt').set({
            message: 'Password (just so we know it\'s you!)',
            title: "WELCOME BACK!",
            transition: 'fade',
            type: 'password',
            value: '',
            onok: function (evt, value) {
                if (value == password) {
                    signInUser(username, value, false);
                }
                else {
                    alertify.dialog('alert').set({
                        message: 'Wrong Password',
                        title: "Try Again!",
                        transition: 'pulse',
                    }).show();
                    return;
                }
            },
            oncancel: function (evt, value) {
                return;
            }
        }).show();
    }
    else {
        alertify.dialog('prompt').set({
            message: 'Set a password!',
            title: "WELCOME!",
            transition: 'fade',
            type: 'password',
            value: '',
            onok: function (evt, value) {
                if (value == "")
                {
                    alertify.dialog('alert').set({
                        message: 'Password cannot be blank!',
                        title: "Try Again!",
                        transition: 'pulse',
                    }).show();
                    return;
                }
                signInUser(username, value, true);
            },
            oncancel: function (evt, value) {
                return;
            }
        }).show();
    }
}

function signInUser(username, password, newUser)
{
    sessionUser = username;

    var user = document.getElementById("user");
    user.innerHTML = "Welcome, " + username;

    var userContainer = document.getElementById("userContainer");
    userContainer.onclick = "";

    if (newUser)
    {
        var url = "newuser.php";
        $.ajax({
            url: url,
            type: 'POST',
            data: {
                username: username,
                password: password
            },
            success: function () {

            },
            error: function (xhr, ajaxOptions, thrownError) {
                alertify.dialog('alert').set({
                    message: 'Please try again!',
                    title: "Error",
                    transition: 'fade',
                }).show();
            }
        });
    }

    updateUserMarkers();
}

function updateUserMarkers()
{
    clearBlueMarkers();
    getMarkersFromFile();
}

function getMarkersFromFile() {
    var file = "markers.txt";

    $.get(file, function (data) {
        var text = data.split('\n');
        
        for (i = 0; i < text.length; i++)
        {
            var line = text[i].split('|||');
            if (line.length != 8) continue;

            var user = line[0];

            var lat = parseFloat(line[1]);
            var lng = parseFloat(line[2]);

            var title = line[3];
            var story = line[4];
            
            var time = line[5];

            var votes = parseInt(line[6]);
            var userUpvotes = line[7];

            createBlueMarker(user, map, { lat: lat, lng: lng }, title, story, time, votes, userUpvotes);
        }
    }, 'text');
}

function deleteMarker(id)
{
    marker = markers[id];
    marker.setMap(null);
}

function isInfoWindowOpen(window)
{
    var info = window.getMap();
    return (info !== null && typeof info !== "undefined");
}

function clearBlueMarkers() {
    blueMarkers.forEach(function (blueMarker) {
        blueMarker.setMap(null);
    });
}

function closeBlueMarkerWindows() {
    for (i = 0; i < infoWindows.length; i++)
    {
        if (isInfoWindowOpen(infoWindows[i]))
            infoWindows[i].close();
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function showWindow(id) {
    $(document).ready(function () {

        //Set window as active
        $(id).addClass('active');

        //Get the screen height and width
        var maskHeight = $(document).height();
        var maskWidth = $(window).width();

        //Set height and width to mask to fill up the whole screen
        $('#mask').css({ 'width': maskWidth, 'height': maskHeight });

        //transition effect
        $('#mask').fadeTo("slow", 0.8);

        //Get the window height and width
        var winH = $(window).height();
        var winW = $(window).width();

        //Set the popup window to center
        $(id).css('top', winH / 2 - $(id).height() / 2);
        $(id).css('left', winW / 2 - $(id).width() / 2);

        //transition effect
        $(id).fadeIn(1000);

        //if close button is clicked
        $('.window.active .close').click(function (e) {
            //Cancel the link behavior
            e.preventDefault();
            $('#mask, .window').hide();
            $(id).removeClass('active');
        });

        //if mask is clicked
        $('#mask').click(function () {
            $(this).hide();
            $('.window').hide();
            $(id).removeClass('active');
        });

        $(window).resize(function () {

            var box = $('#boxes .window.active');

            //Get the screen height and width
            var maskHeight = $(document).height();
            var maskWidth = $(window).width();

            //Set height and width to mask to fill up the whole screen
            $('#mask').css({ 'width': maskWidth, 'height': maskHeight });

            //Get the window height and width
            var winH = $(window).height();
            var winW = $(window).width();

            //Set the popup window to center
            box.css('top', winH / 2 - box.height() / 2);
            box.css('left', winW / 2 - box.width() / 2);

        });
    });
}

function openStoryWindow() {
    showWindow('#storyDialog');

    var storyMap = document.getElementById('storyMap');
    var container = document.getElementById('storySect2');

    var lat = markers[id].getPosition().lat();
    var lng = markers[id].getPosition().lng();
    var width = storyMap.offsetWidth;
    var height = storyMap.offsetHeight;
    var style = getStaticMapStyle(mapStyle);

    storyMap.src = 'https://maps.googleapis.com/maps/api/staticmap?center=' + lat + ',' + lng +
        '&size=' + width + 'x' + height +
        '&zoom=' + (map.getZoom() - 1) +
        '&maptype=' + map.getMapTypeId() +
        '&key=AIzaSyAoeg5Ucj8Yoanh75dhSHfG4dN5AY0ArWE' +
        '&sensor=false' +
        '&markers=icon:/img/map-marker.png|' + lat + ',' + lng +
        '&style=' + style;
}

function getStaticMapStyle(styles) {
    var result = [];
    styles.forEach(function (v, i, a) {
        var style = '';
        if (v.stylers.length > 0) { // Needs to have a style rule to be valid.
            style += (v.hasOwnProperty('featureType') ? 'feature:' + v.featureType : 'feature:all') + '|';
            style += (v.hasOwnProperty('elementType') ? 'element:' + v.elementType : 'element:all') + '|';
            v.stylers.forEach(function (val, i, a) {
                var propertyname = Object.keys(val)[0];
                var propertyval = val[propertyname].toString().replace('#', '0x');
                style += propertyname + ':' + propertyval + '|';
            });
        }
        result.push('style=' + encodeURIComponent(style))
    });

    return result.join('&');
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.onload = function () {
    var elem = document.getElementById('storyTime');
    var timer = new Timer(elem);
    timer.start();

    monitorWindowSize();
    showWindow('#introDialog');
    getMarkersFromFile();

    $(function () {
        $('body').removeClass('fade-out');
        $('body').attr('onresize', 'monitorWindowSize()')
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var Timer = (function () {
    function Timer(element) {
        this.span = element;
        this.span.id = 'storyTime';
        this.span.innerText = getDateTimeString();
    }
    Timer.prototype.start = function () {
        var _this = this;
        this.timerToken = setInterval(function () { return _this.span.innerHTML = getDateTimeString(); }, 500);
    };
    Timer.prototype.stop = function () {
        clearTimeout(this.timerToken);
    };
    return Timer;
}());

function getDateTimeString() {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    var date    = new Date();
    var dayName = days[date.getDay()];
    var dayNum  = date.getDate();
    var month   = months[date.getMonth()];
    var year    = date.getFullYear();
    var hours   = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var ampm = "PM";

    if (hours < 12) ampm = "AM";
    if (hours == 12) hours = 12; else hours = hours % 12;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    var str = dayName + ", " + dayNum + " " + month + " " + year + " " + hours + ":" + minutes + ":" + seconds + " " + ampm;
    return str;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function monitorWindowSize() {
    var screenWidth  = screen.width;
    var screenHeight = screen.height;

    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

    makeChanges(screenWidth, screenHeight);
    makeChanges(windowWidth, windowHeight);
}

function makeChanges(width, height) {
    if (width < 610)
        $('#introTag').css('display', 'none');
    else
        $('#introTag').css('display', 'block');

    if (width < 420)
        $('#storyTag').css('display', 'none');
    else
        $('#storyTag').css('display', 'block');

    if (width < 670)
        $('#storyTime').css('display', 'none');
    else
        $('#storyTime').css('display', 'block');

    if (width < 715) {
        $('#storySect2').css('display', 'none');
        $('#storySect3').css('width', '100%');
    }
    else {
        $('#storySect2').css('display', 'block');
        $('#storySect3').css('width', '60%');
    }

    if (width < 575) {
        $('#introDialog').css('width', '100%');
        $('#storyDialog').css('width', '100%');

        $('#introText').css('width', '100%');
        $('#storyText').css('width', '100%');
    }
    else {
        $('#introDialog').css('width', '60%');
        $('#storyDialog').css('width', '70%');

        $('#introText').css('width', '80%');
        $('#storyText').css('width', '90%');
    }

    if (width < 700)
        $('#searchBox').css('width', '50%');
    else
        $('#searchBox').css('width', '25%');

    if (height < 600) {
        $('#introDialog').css('height', '100%');
        $('#storyDialog').css('height', '100%');
    }
    else {
        $('#introDialog').css('height', '80%');
        $('#storyDialog').css('height', '80%');
    }

    if (height < 550)
        $('#blueMarkerTime').css('display', 'none');
    else
        $('#blueMarkerTime').css('display', 'block');
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function publishDialog() {
    alertify.dialog('confirm').set({
        message: 'Are you sure you want to publish this story?',
        labels: { ok: 'Publish', cancel: 'Cancel' },
        onok: function (closeEvent) { publishStory(); },
        title: "Publish",
        transition: 'fade',
    }).show();
}

function publishStory() {
    var user = sessionUser;
    if (user == "~")
        user = "";

    var title = document.getElementById('storyTitle').value;
    var story = document.getElementById('storyDescription').value;

    story = story.split('\n').join("\\n");

    if (story == "")
    {
        alertify.dialog('alert').set({
            message: 'Your story is blank!',
            title: "Publish",
            transition: 'fade',
        }).show();
        return;
    }

    var lat = markers[id].getPosition().lat().toString();
    var lng = markers[id].getPosition().lng().toString();

    var time = getDateTimeString();

    var url = "publish.php";

    $.ajax({
        url: url,
        type: 'POST',
        data: {
            user: user,
            lat: lat,
            lng: lng,
            title: title,
            story: story,
            time: time,
            upvotes: 0
        },
        success: function () {
            alertify.dialog('alert').set({
                message: 'Your story has been published!',
                title: "Congratulations!",
                transition: 'fade',
            }).show();
            createBlueMarker(user, map, { lat: parseFloat(lat), lng: parseFloat(lng) }, title, story, time, 0, "");
            infoBox.close();
            deleteMarker(id);
            $('#mask, .window').hide();
            $(id).removeClass('active');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alertify.dialog('alert').set({
                message: 'Please try again!',
                title: "Error",
                transition: 'fade',
            }).show();
        }
    });
}
