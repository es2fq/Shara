var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('content'), {
        center: { lat: 38.8899, lng: -77.009 },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 16,
        styles: [{ "featureType": "all", "elementType": "all", "stylers": [{ "hue": "#ff0000" }, { "saturation": -100 }, { "lightness": -30 }] }, { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#ffffff" }] }, { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{ "color": "#353535" }] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#656565" }] }, { "featureType": "poi", "elementType": "geometry.fill", "stylers": [{ "color": "#505050" }] }, { "featureType": "poi", "elementType": "geometry.stroke", "stylers": [{ "color": "#808080" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#454545" }] }, { "featureType": "transit", "elementType": "labels", "stylers": [{ "hue": "#000000" }, { "saturation": 100 }, { "lightness": -40 }, { "invert_lightness": true }, { "gamma": 1.5 }] }]
    });
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            map.setCenter(pos);

            var marker = new google.maps.Marker({
                draggable: true,
                position: pos,
                map: map,
                title: "Your location"
            });

            var openButton = document.getElementById('infoContainer');

            var infoBox = new google.maps.InfoWindow({
                content: openButton,
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

                /* The DIV we want to change is above the .gm-style-iw DIV.
                 * So, we use jQuery and create a iwBackground variable,
                 * and took advantage of the existing reference to .gm-style-iw for the previous DIV with .prev().
                 */
                var iwBackground = iwOuter.prev();

                // Remove the background shadow DIV
                iwBackground.children(':nth-child(2)').css({ 'display': 'none' });

                // Remove the white background DIV
                iwBackground.children(':nth-child(4)').css({ 'display': 'none' });

                // Changes the desired color for the tail outline.
                // The outline of the tail is composed of two descendants of div which contains the tail.
                // The .find('div').children() method refers to all the div which are direct descendants of the previous div. 
                iwBackground.children(':nth-child(3)').find('div').children().css({ 'box-shadow': 'black 0px 1px 6px', 'z-index': '1' });

                // Taking advantage of the already established reference to
                // div .gm-style-iw with iwOuter variable.
                // You must set a new variable iwCloseBtn.
                // Using the .next() method of JQuery you reference the following div to .gm-style-iw.
                // Is this div that groups the close button elements.
                var iwCloseBtn = iwOuter.next();

                // Apply the desired effect to the close button
                iwCloseBtn.css({
                    opacity: '1',
                    right: '53px', top: '1px'
                });

                // The API automatically applies 0.7 opacity to the button after the mouseout event.
                // This function reverses this event to the desired value.
                iwCloseBtn.mouseout(function () {
                    $(this).css({ opacity: '1' });
                });
            });

            infoBox.open(map, marker);

            marker.addListener('click', function () {
                infoBox.open(map, marker);
            });
        });
    }

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

window.onload = function () {
    var elem = document.getElementById('content');

};