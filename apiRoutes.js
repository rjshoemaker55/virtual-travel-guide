const unirest = require('unirest');
const inquirer = require('inquirer');
const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');
momentDurationFormatSetup(moment);

const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
  const {
    destinationCity,
    originCity,
    departureDate,
    returnDate
  } = request.body;

  let responseObj = {};

  citySearch(destinationCity, originCity, departureDate, returnDate);

  const citySearch = (
    destinationCity,
    originCity,
    departureDate,
    returnDate
  ) => {
    const req1 = unirest(
      'GET',
      'https://apidojo-kayak-v1.p.rapidapi.com/locations/search'
    );

    req1.query({
      where: destination
    });

    req1.headers({
      'x-rapidapi-host': 'apidojo-kayak-v1.p.rapidapi.com',
      'x-rapidapi-key': '2f3a0e5559mshf0b9a7a94324ff7p1bf4dajsna06e1715474c'
    });

    const req2 = unirest(
      'GET',
      'https://apidojo-kayak-v1.p.rapidapi.com/locations/search'
    );

    req2.query({
      where: origin
    });

    req2.headers({
      'x-rapidapi-host': 'apidojo-kayak-v1.p.rapidapi.com',
      'x-rapidapi-key': '2f3a0e5559mshf0b9a7a94324ff7p1bf4dajsna06e1715474c'
    });

    req1.end(function(res1) {
      if (res1.error) throw new Error(res1.error);

      destCity = res1.body.filter(result => result.loctype === 'city')[0];
      destAirport = res1.body.filter(result => result.loctype === 'ap')[0];

      req2.end(function(res2) {
        if (res2.error) throw new Error(res2.error);

        originAirport = res2.body.filter(result => result.loctype === 'ap')[0];

        hotelSearch(
          destCity.ctid,
          checkindate,
          checkoutdate,
          destAirport.apicode,
          originAirport.apicode
        );
      });
    });
  };

  const hotelSearch = (
    cityId,
    checkInDate,
    checkOutDate,
    destAirportCode,
    originAirportCode
  ) => {
    let req = unirest(
      'GET',
      'https://apidojo-kayak-v1.p.rapidapi.com/hotels/create-session'
    );

    req.query({
      rooms: '1',
      citycode: cityId,
      checkin: checkInDate,
      checkout: checkOutDate,
      adults: '1'
    });

    req.headers({
      'x-rapidapi-host': 'apidojo-kayak-v1.p.rapidapi.com',
      'x-rapidapi-key': '2f3a0e5559mshf0b9a7a94324ff7p1bf4dajsna06e1715474c'
    });

    req.end(function(res) {
      if (res.error) throw new Error(res.error);

      displayHotelResults(res.body);
      flightSearch(
        originAirportCode,
        destAirportCode,
        checkInDate,
        checkOutDate
      );
    });
  };

  const displayHotelResults = results => {
    let hotelList = [];

    for (i = 0; i <= 4; i++) {
      let hotel = results.hotelset[i];

      let {
        userrating: userRating,
        address: hotelAddress,
        city: hotelCity,
        country: hotelCountry,
        name: hotelName,
        price: hotelPrice
      } = hotel;

      hotelList.push(hotel);
    }
    console.log(hotelList);
  };

  const flightSearch = (
    originAirportCode,
    destAirportCode,
    departDate,
    returnDate
  ) => {
    console.clear();

    let req = unirest(
      'GET',
      'https://apidojo-kayak-v1.p.rapidapi.com/flights/create-session'
    );

    req.query({
      origin1: originAirportCode,
      origin2: destAirportCode,
      destination1: destAirportCode,
      destination2: originAirportCode,
      departdate1: departDate,
      departdate2: returnDate,
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

      displayFlightResults(results);
    });
  };

  const displayFlightResults = results => {
    console.clear();

    for (i = 0; i <= 4; i++) {
      let trip = results.tripset[Object.keys(results.tripset)[i]];

      let flightPrice = trip.displayLowTotal;

      let legs = trip.legs;

      console.log(`
      Flight ${i + 1} | Price: ${flightPrice}
      ---------------------------------------
      `);

      legs.forEach((leg, lI) => {
        let totalDuration = moment
          .duration(leg.duration, 'minutes')
          .format('h [hours] mm [minutes]');

        if (lI === 0) {
          console.log(`
        Departing Fight | Duration: ${totalDuration}
          `);
        } else {
          console.log(`
        Returning Flight: | Duration: ${totalDuration}
          `);
        }

        legs[lI].segments.forEach((segment, sI) => {
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
      });
      console.log(`
          ---------------------------------------
      `);
    }
  };
});

module.exports = router;
