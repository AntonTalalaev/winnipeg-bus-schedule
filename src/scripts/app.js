APIKey = 'J9BnB98MwTTTmVYDGXke';
urlBase = 'https://api.winnipegtransit.com/v3/';
urlStreets = `${urlBase}streets.json?api-key=${APIKey}&usage=long&name=`;
urlStops = `${urlBase}stops.json?api-key=${APIKey}&usage=long&street=`;
urlStopSchedulePart1 = `${urlBase}stops/`;
urlStopSchedulePart2 = `/schedule.json?api-key=${APIKey}&usage=long`;

const inputElement = document.querySelector('aside input');
const streetsElement = document.querySelector('.streets');
const titleStreetNameElement = document.getElementById('street-name');
const tbodyElement = document.querySelector('tbody');

const numOfNextBusesToShow = 2;

/**
 * Method to make API calls and return JSON
 * @param {string} url - URL string for API call
 */
function fetchJSON(url) {
    return fetch(url)
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                Promise.reject({ resp: resp.status, resp: resp.statusText });
            }
        })
        .catch(err => {
            console.log(err);
        });
};

/**
 * Method that displays for User a message that no Stops found on the street
 */
const displayNoStopsFoundMessage = function () {
    tbodyElement.insertAdjacentHTML('beforeend',
        `<tr>
            <td>Sorry, no stops were found on the street.</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>`
    );
};

/**
 * Method that displays for User a message that no Streets found
 */
const displayNoStreetsFoundMessage = function () {
    streetsElement.insertAdjacentHTML('beforeend',
        `<p>Sorry, no results were found.</p>`
    );
};

/**
 * Method to display street search results
 * @param {Array} streets - list of streets
 */
const createStreetsList = function (streets) {
    for (const street of streets) {
        streetsElement.insertAdjacentHTML('beforeend',
            `<a href="#" data-street-key="${street.key}">${street.name}</a>`
        );
    }
};

/**
 * EventListener for street search input
 */
inputElement.addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        streetsElement.innerHTML = '';
        fetchJSON(urlStreets + inputElement.value)
            .then(json => {
                if (json.streets.length === 0) {
                    displayNoStreetsFoundMessage();
                } else {
                    createStreetsList(json.streets);
                }
            })
            .catch(err => {
                console.log(err);
            });
    }
});

/**
 * Method creates table row HTML (next bus) and returns it
 * @param {Object} stop 
 * @param {Object} route 
 * @param {Object} scheduledStop 
 */
const createRowHTML = function (stop, route, scheduledStop) {
    return `<tr>
                <td>${stop.street.name}</td>
                <td>${stop["cross-street"].name}</td>
                <td>${stop.direction}</td>
                <td>${route.route.key}</td> 
                <td>${getTimeShort(scheduledStop.times.arrival.scheduled)}</td>
            </tr> `;
};

/**
 * Method to show current street name (that choose user) at the page title
 * @param {string} streetName - name of the street 
 */
const setTitleStreetName = function (streetName) {
    titleStreetNameElement.textContent = `Displaying results for ${streetName}`;
};

/**
 * Method to convert full date string into short format: 
 * Example: 11:05 PM
 * @param {string} dateStr - full date format
 */
const getTimeShort = function (dateStr) {
    const dateObject = new Date(dateStr);
    let hours = dateObject.getHours();
    let minutes = dateObject.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
};

/**
 * Method to display all found stops and next busses for the choosen street
 * @param {string} streetKey - ID of the street
 * @param {string} streetName - name of the street
 */
const displayStopsTable = function (streetKey, streetName) {
    fetchJSON(urlStops + streetKey)
        .then(json => {
            tbodyElement.innerHTML = '';
            if (json.stops.length === 0) {
                displayNoStopsFoundMessage();
                throw Error(`No stops found on the street ${streetName}`);
            }
            return json.stops;
        })
        .then(stops => {    
            stops.forEach(stop => {
                let tableHTML = '';
                fetchJSON(urlStopSchedulePart1 + stop.key + urlStopSchedulePart2)
                    .then(json => {
                        if (json['stop-schedule']['route-schedules'].length === 0) {
                            throw Error(`Didn't found scheduled buses for the stop`);
                        }
                        json['stop-schedule']['route-schedules'].forEach(route => {
                            for (let i = 0; i < route['scheduled-stops'].length; i++) {
                                if (i >= numOfNextBusesToShow) {
                                    break;
                                }
                                tableHTML += createRowHTML(stop, route, route['scheduled-stops'][i]);
                            }
                        });
                        tbodyElement.insertAdjacentHTML('afterbegin', tableHTML);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            });
        })
        .catch(err => {
            console.log(err);
        });
};

/**
 * EventListener of the street elements
 */
streetsElement.addEventListener('click', function (event) {
    if (event.target.tagName.toLowerCase() === 'a') {
        setTitleStreetName(event.target.textContent);
        displayStopsTable(event.target.dataset.streetKey, event.target.textContent);
    }
});