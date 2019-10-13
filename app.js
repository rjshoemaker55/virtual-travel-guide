const unirest = require('unirest');
const inquirer = require('inquirer');

let req = unirest(
  'GET',
  'https://apidojo-kayak-v1.p.rapidapi.com/flights/create-session'
);

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

      displayResults(results.segset[Object.keys(results.segset)[0]]);
    });
  });

const displayResults = results => {
  console.clear();

  const airline = results.airlineCode;
  const flightNumber = `${airline}-${results.flightNumber}`;
  const originCode = results.originCode;
  const destCode = results.destinationCode;
  const leaveTime = results.leaveTimeDisplay;
  const arriveTime = results.arriveTimeDisplay;

  console.log(`
    Your Flight:

    Airline: ${airline}
    Flight Number: ${flightNumber}
    Origin Airport: ${originCode}
    Destination Airport: ${destCode}
    Leave Time: ${leaveTime}
    Arrive Time: ${arriveTime}
  `);
};
