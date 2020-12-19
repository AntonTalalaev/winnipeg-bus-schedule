APIKey = 'J9BnB98MwTTTmVYDGXke';
urlBase = 'https://api.winnipegtransit.com/v3/'
urlStreets = `${urlBase}streets.json?api-key=${APIKey}&usage=long&name=`;
urlStops = `${urlBase}stops.json?api-key=${APIKey}&usage=long&street=`
urlStopSchedulePart1 = `${urlBase}stops/`
urlStopSchedulePart2 = `/schedule.json?api-key=${APIKey}&start=2020-12-17T08:00:00&end=2020-12-17T23:00:00&usage=long` // remove start and end !!!

const inputElement = document.querySelector('aside input');
const streetsElement = document.querySelector('.streets');
const titleStreetNameElement = document.getElementById('street-name');
const tbodyElement = document.querySelector('tbody');

const numOfNextBusesToShow = 2;


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
}


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
}

const displayNoStreetsFoundMessage = function () {
    streetsElement.insertAdjacentHTML('beforeend',
        `<p>Sorry, no results were found.</p>`
    );
}

const createStreetsList = function (streets) {
    for (const street of streets) {
        streetsElement.insertAdjacentHTML('beforeend',
            `<a href="#" data-street-key="${street.key}">${street.name}</a>`
        );
    }
}

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


const setTitleStreetName = function (streetName) {
    titleStreetNameElement.textContent = `Displaying results for ${streetName}`;
}

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
}

const displayStopsTable = function (stops) {
    stops.forEach(stop => {
        let tableHTML = '';
        fetchJSON(urlStopSchedulePart1 + stop.key + urlStopSchedulePart2)
            .then(json => {
                if (json['stop-schedule']['route-schedules'].length === 0) {
                    throw Error(`Didn't found scheduled buses for stop ${json.stop.name}`);
                }
                console.log(json);

                json['stop-schedule']['route-schedules'].forEach(route => {
                    for (let i = 0; i < route['scheduled-stops'].length; i++) {
                        if (i >= numOfNextBusesToShow) {
                            break;
                        }
                        tableHTML += `<tr>
                    <td>${stop.street.name}</td>
                    <td>${stop["cross-street"].name}</td>
                    <td>${stop.direction}</td>
                    <td>${route.route.key}</td> 
                    <td>${getTimeShort(route['scheduled-stops'][i].times.arrival.scheduled)}</td>
                    </tr> `;
                    }
                });
                tbodyElement.insertAdjacentHTML('afterbegin', tableHTML);
            })
            .catch(err => {
                // need to display error to user
                console.log(err);
            });
    });
}


streetsElement.addEventListener('click', function (event) {
    if (event.target.tagName.toLowerCase() === 'a') {
        setTitleStreetName(event.target.textContent);
        fetchJSON(urlStops + event.target.dataset.streetKey)
            .then(json => {
                tbodyElement.innerHTML = '';
                if (json.stops.length === 0) {
                    displayNoStopsFoundMessage();
                    throw Error(`No stops found on the street ${event.target.textContent}`);
                }
                displayStopsTable(json.stops);
            })
            .catch(err => {
                // need to display error to user
                console.log(err);
            });
    }
});


