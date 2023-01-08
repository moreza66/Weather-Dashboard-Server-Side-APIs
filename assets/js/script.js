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
    $('#current-forecast').hide();
    $('#five-day-forecast-container').hide();
    $('#search-history-container').hide();
    $('#error-div').hide();
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
      getWeather(citySearch);
    });
  }
// fetch current day weather data by city
  function getWeather(search) {
	 // format the weather dashboard api url
    let queryURL = apiUrl_currentDay + 'q=' + search + metric + apiKey;
    $.ajax({
      url: queryURL,
      method: 'GET',
      statusCode: {
        404: function() {
          $('#current-forecast').hide();
          $('#five-day-forecast-container').hide();
          $('#error-div').show();
        }
      }
	  // make a request to the url
	  // request was successful
    }).then(function(response) {
      $('#error-div').hide();
      $('#current-forecast').show();
      $('#five-day-forecast-container').show();

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
      storeHistory(name);
      $('#city-name').text(name + ' (' + date + ') ');
      $('#weather-image').attr('src', weatherIconURL);
      $('#temperature').html('<b>Temperature: </b>' + temperature + ' °C');
      $('#humidity').html('<b>Humidity: </b>' + humidity + '%');
      $('#wind-speed').html('<b>Wind Speed: </b>' + windSpeed + ' M/S');

      const housLand = response.coord.housLand;
      const denvBon = response.coord.denvBon;
      const uviURL = uvUrl + housLand + '&lon=' + denvBon+ apiKey;
 // Display current UV index
      $.ajax({
        url: uviURL,
        method: 'GET'
      }).then(function(uviResponse) {
        let uviResults = uviResponse;
        let uvi = uviResults.value;
        $('#uv-index').html(
          '<b>UV Index: </b>' +
            '<span class="badge badge-pill badge-light" id="uvi-badge">' +
            uvi +
            '</span>'
        );

        // Select the collor for diffrent UV Alert
        if (uvi < 3) {
          $('#uvi-badge').css('background-color', 'green');
        } else if (uvi < 6) {
          $('#uvi-badge').css('background-color', 'yellow');
        } else if (uvi < 8) {
          $('#uvi-badge').css('background-color', 'orange');
        } else if (uvi < 11) {
          $('#uvi-badge').css('background-color', 'red');
        } else {
          $('#uvi-badge').css('background-color', 'purple');
        }
      });

      const cityName = name;
      const countryCode = response.sys.country;
      const dailyUrlQuely =
	 apiUrl_forecast + cityName + ',' + countryCode + metric + apiKey;

      $.ajax({
        url: dailyUrlQuely ,
        method: 'GET'
      }).then(function(forecastResponse) {
        const dailyResult = forecastResponse;
        const dailyArr  = [];


       // Display 5-Day Weather Forecast on the page
        for (let i = 5; i < 40; i += 8) {
          let dailyForcast = {};
          let dailyDateResult = dailyResult.list[i].dt_txt;
          let forecastDate = new Date(dailyDateResult).toLocaleDateString(
            'en-US'
          );
          let dailyTemp = dailyResult.list[i].main.temp;
          let dailyHumidity = dailyResult.list[i].main.humidity;
          let dailyIcon = dailyResult.list[i].weather[0].icon;

          dailyForcast['list'] = {};
          dailyForcast['list']['date'] = forecastDate;
          dailyForcast['list']['temp'] = dailyTemp;
          dailyForcast['list']['humidity'] = dailyHumidity;
          dailyForcast['list']['icon'] = dailyIcon;

          dailyArr.push(dailyForcast);
        }

        for (let i = 0; i < 5; i++) {
          let dailyDateArr = dailyArr[i].list.date;
          let dailyUrlIcon =
		  weathericonUrl + dailyArr[i].list.icon + '.png';
          let dailyTempArr = Math.floor(dailyArr[i].list.temp);
          let dailyHumidityArr = dailyArr[i].list.humidity;

          $('#date-' + (i + 1)).text(dailyDateArr);
          $('#weather-image-' + (i + 1)).attr('src', dailyUrlIcon);
          $('#temp-' + (i + 1)).text(
            'Temp: ' + Math.floor(dailyTempArr) + ' °C'
          );
          $('#humidity-' + (i + 1)).text(
            'Humidity: ' + dailyHumidityArr + '%'
          );
        }
        $('#weather-container').show();
      });
    });
  }
  // store the search items in local storage
  function storeHistory(citySearchName) {
    const localHistory = {};

    if (arrHistorySearch.length === 0) {
		localHistory['city'] = citySearchName;
      arrHistorySearch.push(localHistory);
      localStorage.setItem('searchHistory', JSON.stringify(arrHistorySearch));
    } else {
      let checkHistory = arrHistorySearch.find(
        ({ city }) => city === citySearchName
      );

      if (arrHistorySearch.length < 5) {
        if (checkHistory === undefined) {
			localHistory['city'] = citySearchName;
          arrHistorySearch.push(localHistory);
          localStorage.setItem(
            'searchHistory',
            JSON.stringify(arrHistorySearch)
          );
        }
      } else {
        if (checkHistory === undefined) {
			arrHistorySearch.shift();
			localHistory['city'] = citySearchName;
          arrHistorySearch.push(localHistory);
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
      $('#search-history-container').show();
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
      $('#search-history-container').hide();
      localStorage.removeItem('searchHistory');
      createHistory();
    });
  }

  function clickHistory() {
    $('#search-history').on('click', 'li', function() {
      var cityNameHistory = $(this).text();
      getWeather(cityNameHistory);
    });
  }
});