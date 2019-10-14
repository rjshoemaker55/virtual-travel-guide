const unirest = require('unirest');
const inquirer = require('inquirer');
const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');

momentDurationFormatSetup(moment);

let req = unirest(
  'GET',
  'https://apidojo-kayak-v1.p.rapidapi.com/flights/create-session'
);

console.clear();

const start = () => {
  inquirer
    .prompt([
      {
        name: 'startchoice',
        type: 'list',
        message: 'Welcome:',
        choices: ['Search Flights', 'Search Hotels']
      }
    ])
    .then(answer => {
      answer.startchoice === 'Search Flights' ? flightSearch() : hotelSearch();
    });
};

const flightSearch = () => {
  console.clear();
  inquirer
    .prompt([
      {
        name: 'origin',
        type: 'input',
        message: 'Origin (airport abbreviation):'
      },
      {
        name: 'destination',
        type: 'input',
        message: 'Destination (airport abbreviation)'
      },
      {
        name: 'departdate',
        type: 'input',
        message: 'Depart Date (YYYY-MM-DD)'
      }
    ])
    .then(answers => {
      console.log('Finding flights...');
      const searchOrigin = answers.origin;
      const searchDest = answers.destination;
      const searchDepDate = answers.departdate;

      req.query({
        origin1: searchOrigin,
        destination1: searchDest,
        departdate1: searchDepDate,
        cabin: 'e',
        currency: 'USD',
        adults: '1',
        bags: '0'
      });

      req.headers({
        'x-rapidapi-host': 'apidojo-kayak-v1.p.rapidapi.com',
        'x-rapidapi-key': '2f3a0e5559mshf0b9a7a94324ff7p1bf4dajsna06e1715474c'
      });

      req.end(function(res) {
        if (res.error) throw new Error(res.error);

        const results = res.body;

        displayResults(results);
      });
    });

  const displayResults = results => {
    console.clear();

    for (i = 0; i <= 4; i++) {
      let trip = results.tripset[Object.keys(results.tripset)[i]];

      let totalDuration = moment
        .duration(trip.duration, 'minutes')
        .format('h [hours] mm [minutes]');

      console.log(`
        Flight ${i + 1} | Duration: ${totalDuration}
        ---------------------------------------
    `);

      let legs = trip.legs;

      legs[0].segments.forEach((segment, sI) => {
        let flightSegment = results.segset[segment];

        let airlineCode = flightSegment.airlineCode;
        let airline = results.airlines[airlineCode];
        let flightNumber = flightSegment.flightNumber;
        let originCode = flightSegment.originCode;
        let origin = results.airportDetails[originCode].name;
        let originCity = results.airportDetails[originCode].city;
        let destinationCode = flightSegment.destinationCode;
        let destination = results.airportDetails[destinationCode].name;
        let destinationCity = results.airportDetails[destinationCode].city;
        let leaveTime = flightSegment.leaveTimeDisplay;
        let arriveTime = flightSegment.arriveTimeDisplay;
        let duration = moment
          .duration(flightSegment.duration, 'minutes')
          .format('h [hours] mm [minutes]');

        console.log(`
        Segment ${sI + 1}: 
        
        Airline: ${airline}
        FlightNumber: ${airlineCode}-${flightNumber}

        Origin: ${origin}
        Destination: ${destination}
        
        Departure time in ${origin}: ${leaveTime}
        Arrival time in ${destinationCity}: ${arriveTime}

        Duration: ${duration}
      `);
      });
      console.log(`
        ---------------------------------------
    `);
    }
  };
};

const hotelSearch = () => {
  console.clear();

  var req = unirest(
    'GET',
    'https://apidojo-kayak-v1.p.rapidapi.com/hotels/create-session'
  );

  req.query({
    airportcode: 'HAN',
    rooms: '1',
    citycode: '42700',
    checkin: '2018-12-20',
    checkout: '2018-12-24',
    adults: '1'
  });

  req.headers({
    'x-rapidapi-host': 'apidojo-kayak-v1.p.rapidapi.com',
    'x-rapidapi-key': '2f3a0e5559mshf0b9a7a94324ff7p1bf4dajsna06e1715474c'
  });

  req.end(function(res) {
    if (res.error) throw new Error(res.error);

    console.log(res.body);
  });
};

start();
