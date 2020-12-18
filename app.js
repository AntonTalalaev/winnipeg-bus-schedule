APIKey = 'J9BnB98MwTTTmVYDGXke';
urlBase = 'https://api.winnipegtransit.com/v3/'
urlStreets = `${urlBase}streets.json?api-key=${APIKey}&usage=long&name=`;
urlStops = `${urlBase}stops.json?api-key=${APIKey}&street=`
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
                createStreetsList(json.streets);
            })
            .catch(err => {
                console.log(err);
            });
    }
});


const setTitleStreetName = function (streetName) {
    titleStreetNameElement.textContent = `Displaying results for ${streetName}`;
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
                    if (i >= numOfNextBusesToShow){
                        break;
                    }
                    tableHTML += `<tr>
                    <td>${stop.street.name}</td>
                    <td>${stop["cross-street"].name}</td>
                    <td>${stop.direction}</td>
                    <td>${route.route.key}</td> 
                    <td>${route['scheduled-stops'][i].times.arrival.scheduled}</td>
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


function createAndInsertInnerHTML(movie) {
    movieListElement.insertAdjacentHTML('afterbegin',
        `<div class='movie'>
            <img class="movie-option" src="${movie.Poster}">
            <div class="movie-info">
                <div>${movie.Title}</div>
                <div>${movie.imdbRating}</div>
                <div>${movie.Plot}</div>
            </div>
        </div>`
    );
}