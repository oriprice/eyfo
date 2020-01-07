
import React from 'react';
import { withRouter } from 'react-router';
import { shape, string } from 'prop-types';
import classnames from 'classnames';

import SearchInput from './components/SearchInput/SearchInput';
import Options from './components/Options/Options';
import styles from './App.scss';

const App = ({ location }) => {
  const [token] = React.useState('');
  return (location.search.indexOf('options') > 0 ? <Options />
    : token && (
    <div>
      <a aria-label="Options" href="?options" target="_blank"><i className={classnames(styles.icon, 'fas fa-cog')} /></a>
      <SearchInput token={token} />
    </div>
    )
  );
};

App.propTypes = {
  location: shape({
    search: string,
  }).isRequired,
};

export default withRouter(App);
