const express = require('express');
const router = express.Router();
const unirest = require('unirest');
const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');
momentDurationFormatSetup(moment);

router.get('/', async (req, res) => {
  const { originCity, destCity, depDate, returnDate } = req.body;

  let responseObj = {
    originCity,
    destCity,
    depDate,
    returnDate
  };

  const req1 = unirest(
    'GET',
    'https://apidojo-kayak-v1.p.rapidapi.com/locations/search'
  );

  req1.query({
    where: destCity
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
    where: originCity
  });

  req2.headers({
    'x-rapidapi-host': 'apidojo-kayak-v1.p.rapidapi.com',
    'x-rapidapi-key': '2f3a0e5559mshf0b9a7a94324ff7p1bf4dajsna06e1715474c'
  });

  req1.end(res1 => {
    if (res1.error) throw new Error(res1.error);

    let destCityId = res1.body.filter(result => result.loctype === 'city')[0]
      .ctid;
    let destAirportCode = res1.body.filter(result => result.loctype === 'ap')[0]
      .apicode;

    req2.end(function(res2) {
      if (res2.error) throw new Error(res2.error);

      originAirportCode = res2.body.filter(result => result.loctype === 'ap')[0]
        .apicode;

      hotelSearch(
        destCityId,
        depDate,
        returnDate,
        destAirportCode,
        originAirportCode
      );

      flightSearch(originAirportCode, destAirportCode, depDate, returnDate);
    });
  });

  hotelSearch = (
    destCityId,
    depDate,
    returnDate,
    destAirport,
    originAirport
  ) => {
    let req3 = unirest(
      'GET',
      'https://apidojo-kayak-v1.p.rapidapi.com/hotels/create-session'
    );

    req3.query({
      rooms: '1',
      citycode: destCityId,
      checkin: depDate,
      checkout: returnDate,
      adults: '1'
    });

    req3.headers({
      'x-rapidapi-host': 'apidojo-kayak-v1.p.rapidapi.com',
      'x-rapidapi-key': '2f3a0e5559mshf0b9a7a94324ff7p1bf4dajsna06e1715474c'
    });

    req3.end(function(res3) {
      if (res3.error) throw new Error(res3.error);

      let hotelList = {};

      for (hI = 0; hI <= 4; hI++) {
        let currentHotel = res3.body.hotelset[hI];

        let {
          name: hotelName,
          userrating: userRating,
          address: hotelAddress,
          city: hotelCity,
          country: hotelCountry,
          price: hotelPrice
        } = currentHotel;

        hotel = {
          hotelName,
          userRating,
          hotelAddress,
          hotelCity,
          hotelCountry,
          hotelPrice
        };

        hotelList[hI] = hotel;
      }
      responseObj['hotelList'] = hotelList;
    });
  };

  flightSearch = (originAirportCode, destAirportCode, depDate, returnDate) => {
    let req4 = unirest(
      'GET',
      'https://apidojo-kayak-v1.p.rapidapi.com/flights/create-session'
    );

    req4.query({
      origin1: originAirportCode,
      origin2: destAirportCode,
      destination1: destAirportCode,
      destination2: originAirportCode,
      departdate1: depDate,
      departdate2: returnDate,
      cabin: 'e',
      currency: 'USD',
      adults: '1',
      bags: '0'
    });

    req4.headers({
      'x-rapidapi-host': 'apidojo-kayak-v1.p.rapidapi.com',
      'x-rapidapi-key': '2f3a0e5559mshf0b9a7a94324ff7p1bf4dajsna06e1715474c'
    });

    req4.end(function(res4) {
      if (res4.error) throw new Error(res4.error);

      const results = res4.body;

      let flightList = {};

      for (fI = 0; fI <= 4; fI++) {
        let trip = results.tripset[Object.keys(results.tripset)[fI]];

        let flightPrice = trip.displayLowTotal;

        let legs = trip.legs;
        let legList = {};

        let flight = {
          flightPrice,
          legs: []
        };

        legs.forEach((leg, lI) => {
          let segmentList = {};

          let totalDuration = moment
            .duration(leg.duration, 'minutes')
            .format('h [hours] mm [minutes]');

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

            console.log(flight);
            console.log(flight.legs[parseInt(lI)]);

            segmentList[sI] = {
              airlineCode,
              airline,
              flightNumber,
              originCode,
              origin,
              originCity,
              destinationCode,
              destination,
              destinationCity,
              leaveTime,
              arriveTime,
              duration
            };
          });
          legList[lI] = segmentList;
          flightList[fI] = legList;
        });
      }
      responseObj['flightList'] = flightList;
    });
  };
});

module.exports = router;
