import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import CityPick from './pages/CityPick';
import Landing from './pages/Landing';
import './App.css';

function App() {
  return (
    <Router>
      <Route exact path='/' component={Landing} />
      <Route exact path='/city' component={CityPick} />
    </Router>
  );
}

export default App;
