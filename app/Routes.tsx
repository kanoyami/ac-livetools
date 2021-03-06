/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import Frame from './containers/Frame';
import HomePage from './containers/HomePage';
import LotteryPage from './containers/LotteryPage';
import VotePage from './containers/VotePage';
// Lazily load routes and code split with webpack
const LazyCounterPage = React.lazy(() =>
  import(/* webpackChunkName: "CounterPage" */ './containers/CounterPage')
);

const CounterPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyCounterPage {...props} />
  </React.Suspense>
);

export default function Routes() {
  return (
    <App>
      <Switch>
        <Frame>
          <Route path={routes.COUNTER} component={CounterPage} />
          <Route path={routes.HOME} component={HomePage} />
          <Route path={routes.LOTTERY} component={LotteryPage} />
          <Route path={routes.VOTE} component={VotePage} />
        </Frame>
      </Switch>
    </App>
  );
}
