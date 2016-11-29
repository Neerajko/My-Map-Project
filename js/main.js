//Create a map variable
var map;
//Create a new blank array for listing markers
var markers = [];
//Locations for markers
var locations = [
    { title: 'Park Ave Penthouse', location: { lat: 48.8566, lng: 2.3522 } },
    { title: 'Chelsea Loft', location: { lat: 40.7444883, lng: -73.9949465 } },
    { title: 'Union Square Open Floor Plan', location: { lat: 40.7347062, lng: -73.9895759 } },
    { title: 'East Village Hip Studio', location: { lat: 41.8902, lng: 12.4922 } },
    { title: 'TriBeCa Artsy Bachelor Pad', location: { lat: 40.7195264, lng: -74.0089934 } },
    { title: 'Chinatown Homey Space', location: { lat: 40.7180628, lng: -73.9961237 } },
    { title: 'My Village', location: { lat: 11.942836, lng: 75.349963 } },
    { title: 'My district', location: { lat: 11.8745, lng: 75.3704 } },
    { title: 'The beautiful place', location: { lat: 28.7041, lng: 77.1025 } },
    { title: 'The fantastic place', location: { lat: 41.40404, lng: 2.17513 } },
    { title: 'The fabulous place', location: { lat: 41.40315, lng: 2.17380 } }
];
//Create a styles array to use  with the maps
var styles = [{
        featureType: 'water',
        stylers: [
            { color: '#124567' }
        ]
    }, {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#ff0000' }]
    }, {
        featureType: 'administrative',
        elementType: 'labels.text.stroke',
        stylers: [
            { color: '#ffffff' },
            { weight: 6 }
        ]
    }, {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#0000ff' }]
    }, {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#000000' }]
    }, {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }]
    }, {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#FF1493 ' }]
    }, {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d34555' }]
    },

];

var markersFunc = function(data) {
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
    this.marker = new google.maps.Marker({
        map: map,
        position: this.location(),
        title: this.title(),      
        animation: google.maps.Animation.DROP
    });
    this.marker.addListener('click', function() {
        populateInfoWindow(this, largeInfowindow);
        toggleBounce(this);
    });
};


var streetViewUrl;
var foursquareUrl;
var foursquareCLIENTID = 'CPEFM1ZMHENMHIURLSO4HO1DGVKEMOZRYXI1JF0RYQTBE3ND';
var foursquareCLIENTSECRET = 'ZOTEYNRF45TZZCZYVEL1HYFMCVUXZEUXUJSQ3L0LHS0TZ3L2';


var ViewModel = function() {
    var self = this;
    self.locationList = ko.observableArray([]);
    self.filter = ko.observable("");
    self.largeInfowindow = new google.maps.InfoWindow();

    self.toggleBounce = function(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() { marker.setAnimation(null); }, 700);

        }
    };

    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
    self.populateInfoWindow = function(marker, infowindow) {
        var link;
        var rating;
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            // infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });


            streetViewUrl = 'https://maps.googleapis.com/maps/api/streetview?size=200x100&location=' + marker.position.lat() + ',' + marker.position.lng() + '&fov=90&heading=235&pitch=10';
            foursquareUrl = 'https://api.foursquare.com/v2/venues/explore?client_id=' +
                foursquareCLIENTID + '&client_secret=' + foursquareCLIENTSECRET +
                '&m=foursquare&v=20140806&ll=' + marker.position.lat() + ',' +
                marker.position.lng() + '&query=' + marker.title;
            $.ajax({
                    url: foursquareUrl,
                    cache: false
                })
                .done(function(data) {
                    var link = data && data.response && data.response.groups && data.response.groups[0].items && data.response.groups[0].items[0].tips && data.response.groups[0].items[0].tips[0].canonicalUrl;
                    var rating = data.response.groups[0].items[0].venue.rating;
                    if (!link && !rating) {
                        // this means nothing about the address
                        infowindow.setContent('<div id = "marker-title"><h2>' + marker.title + '</h2></div><br>' +
                            '<h3>This place has not been on Foursquare.</h3>');


                    } else {
                        // append the content after #marker-title in infowindow
                        if (rating === undefined) {
                            rating = "Not available";

                        }
                        infowindow.setContent('<div id = "marker-title"><h2>' + marker.title + '</h2></div><br>' + '<img src =' + streetViewUrl + '><br>' + '<h3>Foursquare Rating: <span class="rating">' +
                            rating + '</span></h3>' + '<a class="fsqure-link" href="' +
                            link + '" target="new">Foursquare Link</a>');
                    }
                })
                .fail(function() {
                    alert('Foursquare data failed to load.');
                });
        }
    };

    self.showInfo = function(location) {
        google.maps.event.trigger(location.marker, 'click');
    };

    locations.forEach(function(item) {
        self.locationList.push(new markersFunc(item));
    });
    this.filterList = ko.computed(function() {
        self.search = this.filter().toLowerCase();
        if (!search) {
            this.locationList().forEach(function(loc) {
                loc.marker.setVisible(true);
            });
            return this.locationList();
        } else {
            return ko.utils.arrayFilter(this.locationList(), function(loc) {
                if (loc.title().toLowerCase().indexOf(self.search.toLowerCase()) >= 0) {
                    loc.marker.setVisible(true);
                    return true;
                } else {
                    loc.marker.setVisible(false);
                    self.largeInfowindow.close(); //closing an info window when marker is filtered
                    return false;
                }
            });
        }
    }, this);
};

// Create a new blank array for all the listing markers.
var initMap = function() {
    // TODO: use a constructor to create a new map JS object. You can use the coordinates
    // we used, 40.7413549, -73.99802439999996 or your own!
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 11.942836, lng: 75.349963 },
        zoom: 8,
        styles: styles,
        // mapTypeControl: false
    });
    ko.applyBindings(ViewModel);
};

function googleError() {
    alert('Google Map service is not available. Please check your network setttings.')
}