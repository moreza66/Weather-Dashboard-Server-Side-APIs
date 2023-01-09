// create nav bar
// study weather dashboard api documentation
// access weather dashboard api - display in the console
// Add the search form
// Handle form submission
// Add error handling
// Display response data on page
// implement local storage for the searched cities
// implement when user cick on the search item , the weather data shows up.
// Save the work in Git


let citySearch;
//  Global Variables
const apiKey = '&appid=2dc573227afa39e8450aba0fd4974a0d';
// api urls
const weathericonUrl = 'http://openweathermap.org/img/wn/';
const apiUrl_currentDay = 'https://api.openweathermap.org/data/2.5/weather?';

const apiUrl_forecast = 'https://api.openweathermap.org/data/2.5/forecast?q=';
const metric = '&units=metric';
const uvUrl = 'https://api.openweathermap.org/data/2.5/uvi?lat=';


// pick cityname form the search history
let arrHistorySearch = [];

$(document).ready(function() {
  init();

  function init() {
    search();
    $('#now-weather').hide();
    $('#couple-day-weather-container').hide();
    $('#search-bar-container').hide();
    $('#err-block').hide();
    displayHistory();
    clearHistory();
    clickHistory();
  }

// takes user input for fetching the weather data
  function search() {
    $('#search-button').on('click', function() {
      citySearch = $('#search-input')
        .val()
        .trim();

      if (citySearch === '') {
        return;
      }
      $('#search-input').val('');
      getCityWeather(citySearch);
    });
  }
// fetch current day weather data by city
  function getCityWeather(searchValue) {

	 // format the weather dashboard api url
    let queryURL = apiUrl_currentDay + 'q=' + searchValue + metric + apiKey;
    $.ajax({
      url: queryURL,
      method: 'GET',
      statusCode: {
        404: function() {
          $('#now-weather').hide();
          $('#couple-day-weather-container').hide();
          $('#err-block').show();
        }
      }
	  // make a request to the url
	  // request was successful
    }).then(function(response) {
      $('#err-block').hide();
      $('#now-weather').show();
      $('#couple-day-weather-container').show();

	       /* Resource: 
        https://www.epa.gov/sunsafety/uv-index-scale-0
        https://www.epa.gov/sites/production/files/documents/uviguide.pdf 
        https://www.dreamstime.com/illustration/uv-index.html */   
      const results = response;
      const name = results.name;
      const temperature = Math.floor(results.main.temp);
      const humidity = results.main.humidity;
      const windSpeed = results.wind.speed;
      const date = new Date(results.dt * 1000).toLocaleDateString('en-US');
      const weatherIcon = results.weather[0].icon;
      const weatherIconURL = weathericonUrl + weatherIcon + '.png';

     // store the search items in local storage
      saveHistory(name);
      $('#city-name').text(name + ' (' + date + ') ');
      $('#weather-image').attr('src', weatherIconURL);
      $('#temperature').html('<b>Temperature: </b>' + temperature + ' °C');
      $('#humidity').html('<b>Humidity: </b>' + humidity + '%');
      $('#wind-speed').html('<b>Wind Speed: </b>' + windSpeed + ' M/S');

    // getting lat and lon from response 
      const lat = response.coord.lat;
      const lon  = response.coord.lon;
      const uviURL = uvUrl + lat + '&lon=' + lon + apiKey;
    // Display current UV index
      $.ajax({
        url: uviURL,
        method: 'GET'
      }).then(function(uviResponse) {
        const uviResults = uviResponse;
        const uvi = uviResults.value;
        console.log('>>>>>>>', uvi)
        $('#uv-index').html(
          '<b>UV Index: </b>' +
            '<span class="badge badge-pill badge-light" id="uvi-displayer">' +
            uvi +
            '</span>'
        );

        // Select the collor for diffrent UV Alert
        if (uvi < 3) {
          $('#uvi-displayer').css('background-color', 'green');
        } else if (uvi < 6) {
          $('#uvi-displayer').css('background-color', 'yellow');
        } else if (uvi < 8) {
          $('#uvi-displayer').css('background-color', 'orange');
        } else if (uvi < 11) {
          $('#uvi-displayer').css('background-color', 'red');
        } else {
          $('#uvi-displayer').css('background-color', 'purple');
        }
      }).catch(e => console.log(e))

      const cityName = name;
      const countryCode = response.sys.country;
      const weatherUrlQuery =
	 apiUrl_forecast + cityName + ',' + countryCode + metric + apiKey;

      $.ajax({
        url: weatherUrlQuery ,
        method: 'GET'
      }).then(function(forecastResponse) {
        const weatherResults = forecastResponse;
        const weatherArr  = [];


       // Display 5-Day Weather Forecast on the page
        for (let i = 5; i < 40; i += 8) {
          let weatherObj = {};
          let weatherResultDate = weatherResults.list[i].dt_txt;
          let weatherDate = new Date(weatherResultDate).toLocaleDateString(
            'en-US'
          );
          let weatherTemp = weatherResults.list[i].main.temp;
          let weatherHumidity = weatherResults.list[i].main.humidity;
          let weatherIcon = weatherResults.list[i].weather[0].icon;

          weatherObj['list'] = {};
          weatherObj['list']['date'] = weatherDate;
          weatherObj['list']['temp'] = weatherTemp;
          weatherObj['list']['humidity'] = weatherHumidity;
          weatherObj['list']['icon'] = weatherIcon;

          weatherArr.push(weatherObj);
        }

        for (let i = 0; i < 5; i++) {
          const weatherArrDate = weatherArr[i].list.date;
          const weatherUrlIcon =
		  weathericonUrl + weatherArr[i].list.icon + '.png';
          const weatherArrTemp = Math.floor(weatherArr[i].list.temp);
          const weatherArrHumudity = weatherArr[i].list.humidity;

          $('#date-' + (i + 1)).text(weatherArrDate);
          $('#weather-image-' + (i + 1)).attr('src', weatherUrlIcon);
          $('#temp-' + (i + 1)).text(
            'Temp: ' + Math.floor(weatherArrTemp) + ' °C'
          );
          $('#humidity-' + (i + 1)).text(
            'Humidity: ' + weatherArrHumudity + '%'
          );
        }
        $('#weather-container').show();
      });
    })
    .catch(e => console.log(e))
    ;
  }
  // store the search items in local storage
  function saveHistory(citySearchName) {
    const historySearchObj = {};

    if (arrHistorySearch.length === 0) {
		historySearchObj['city'] = citySearchName;
      arrHistorySearch.push(historySearchObj);
      localStorage.setItem('searchHistory', JSON.stringify(arrHistorySearch));
    } else {
      let checkHistory = arrHistorySearch.find(
        ({ city }) => city === citySearchName
      );

      if (arrHistorySearch.length < 5) {
        if (checkHistory === undefined) {
			historySearchObj['city'] = citySearchName;
          arrHistorySearch.push(historySearchObj);
          localStorage.setItem(
            'searchHistory',
            JSON.stringify(arrHistorySearch)
          );
        }
      } else {
        if (checkHistory === undefined) {
			arrHistorySearch.shift();
			historySearchObj['city'] = citySearchName;
          arrHistorySearch.push(historySearchObj);
          localStorage.setItem(
            'searchHistory',
            JSON.stringify(arrHistorySearch)
          );
        }
      }
    }
    $('#search-history').empty();
    displayHistory();
  }

  function displayHistory() {
    const savedHistory = localStorage.getItem('searchHistory');
    const engineResult = JSON.parse(savedHistory);

    if (savedHistory === null) {
      createHistory();
      savedHistory = localStorage.getItem('searchHistory');
      engineResult = JSON.parse(savedHistory);
    }

    for (let i = 0; i < engineResult.length; i++) {
      let historyLi = $('<li>');
      historyLi.addClass('list-group-item');
      historyLi.text(engineResult[i].city);
      $('#search-history').prepend(historyLi);
      $('#search-bar-container').show();
    }
    return (arrHistorySearch = engineResult);
  }

  function createHistory() {
    arrHistorySearch.length = 0;
    localStorage.setItem('searchHistory', JSON.stringify(arrHistorySearch));
  }
// empties the search history list upon clicking the clear history button
  function clearHistory() {
    $('#clear-button').on('click', function() {
      $('#search-history').empty();
      $('#search-bar-container').hide();
      localStorage.removeItem('searchHistory');
      createHistory();
    });
  }

  function clickHistory() {
    $('#search-history').on('click', 'li', function() {
      var cityNameHistory = $(this).text();
      getCityWeather(cityNameHistory);
    });
  }
});