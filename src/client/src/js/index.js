import React from 'react';
import {render} from 'react-dom';
import App from '../components/App.js'
import '../css/index.css'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import history from './history.js';
import Blocks from '../components/Blocks.js'
import ReactDOM from 'react-dom';
import ConductTransaction from '../components/ConductTransaction.js';
import TransactionPool from '../components/TransactionPool.js'




ReactDOM.render(
    <Router history={history}>
    <Switch>
      <Route exact path='/' component={App} />
      <Route path='/blocks' component={Blocks} />
      <Route path="/conductTransaction" component={ConductTransaction} />
      <Route path="/transactionPool" component={TransactionPool} />
    </Switch>
  </Router>
,document.getElementById('root'));
