var map;
var id = null, markers = {};
var infoBox = null;
var infoWindows = [];
var mapStyle = [{ "featureType": "all", "elementType": "all", "stylers": [{ "hue": "#ff0000" }, { "saturation": -100 }, { "lightness": -30 }] }, { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#ffffff" }] }, { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{ "color": "#353535" }] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#656565" }] }, { "featureType": "poi", "elementType": "geometry.fill", "stylers": [{ "color": "#505050" }] }, { "featureType": "poi", "elementType": "geometry.stroke", "stylers": [{ "color": "#808080" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#454545" }] }, { "featureType": "transit", "elementType": "labels", "stylers": [{ "hue": "#000000" }, { "saturation": 100 }, { "lightness": -40 }, { "invert_lightness": true }, { "gamma": 1.5 }] }];

function initMap() {
    map = new google.maps.Map(document.getElementById('content'), {
        center: { lat: 38.8899, lng: -77.009 },
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

            createMarkerWithStoryButton(map, pos);
        });
    }

    google.maps.event.addListener(map, "click", function (event) {
        infoBox.close();
        for (i = 0; i < infoWindows.length; i++)
            infoWindows[i].close();
    });

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

function createBlueMarker(map, pos, title, desc) {
    var iconBase = 'img/map-marker2.png';

    var marker = new google.maps.Marker({
        draggable: false,
        position: pos,
        map: map,
        icon: iconBase
    });

    var contentString = 
        '<div id="blueMarker">' +
            '<div id="title">' + title + '</div>' +
            '<div id="description">' + desc + '</div>' +
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

function getMarkersFromFile() {
    var file = "markers.txt";

    $.get(file, function (data) {
        var text = data.split('\n');
        
        for (i = 0; i < text.length; i++)
        {
            var line = text[i].split(',');
            if (line.length != 4) return;

            var lat = parseFloat(line[0]);
            var lng = parseFloat(line[1]);

            var title = line[2];
            var desc  = line[3];

            createBlueMarker(map, { lat: lat, lng: lng }, title, desc);
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

    if (hours == 12) hours = 12; else hours = hours % 12;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    var str = dayName + ", " + dayNum + " " + month + " " + year + " " + hours + ":" + minutes + ":" + seconds;
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
    var title = document.getElementById('storyTitle').value;
    var story = document.getElementById('storyDescription').value;

    if (story == "")
    {
        alertify.dialog('alert').set({
            message: 'Your story is blank!',
            title: "Publish",
            transition: 'fade',
        }).show();
        return;
    }

    var lat = markers[id].getPosition().lat();
    var lng = markers[id].getPosition().lng();

    var url = "publish.php";
    var params = "title=" + title + "&story=" + story + "&lat=" + lat + "&lng=" + lng;

    $.ajax({
        url: url,
        type: 'POST',
        data: params,
        success: function () {
            alert('success');
        },
        error: function () {
            
        }
    });
}