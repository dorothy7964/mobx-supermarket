import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import App from './App';
import CounterStore from './stores/counter';
import MarketStore from './stores/market';

const counter = new CounterStore();
const market = new MarketStore();

ReactDOM.render(
  <Provider counter={counter} market={market}>
    <App />
  </Provider>,
  document.getElementById('root')
);
