import React from 'react';
import { withRouter } from 'react-router';
import { shape, string } from 'prop-types';
import classnames from 'classnames';

import SearchInput from './components/SearchInput/SearchInput';
import Options from './components/Options/Options';
import styles from './App.scss';

const App = ({ location }) => (location.search.indexOf('options') > 0 ? <Options />
  : (
    <div>
      <a href="?options" target="_blank"><i className={classnames(styles.icon, 'fas fa-cog')} /></a>
      <SearchInput />
    </div>
  )
);

App.propTypes = {
  location: shape({
    search: string,
  }).isRequired,
};

export default withRouter(App);
