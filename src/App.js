
import React from 'react';
import { withRouter } from 'react-router';
import { shape, string } from 'prop-types';
import classnames from 'classnames';

import SearchInput from './components/SearchInput/SearchInput';
import Options from './components/Options/Options';
import styles from './App.scss';
import { getFromStorage } from './utils/storageUtils';


const App = ({ location }) => {
  const [token, setToken] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    getFromStorage('token').then((tokenFromStorage) => { setToken(tokenFromStorage); setLoading(false); });
  });
  if (loading) {
    return <div className={styles.emptyState} />;
  }
  return (location.search.indexOf('options') > 0
    ? <Options /> : renderMainApp(token)
  );
};

function renderMainApp(token) {
  return (token ? (
    <div>
      <a aria-label="Options" href="?options" target="_blank"><i className={classnames(styles.icon, 'fas fa-cog')} /></a>
      <SearchInput token={token} />
    </div>
  ) : (
    <div className={styles.noTokenMessage}>
      Searching private repositories requires a GitHub access token.
      Please go to &nbsp;
      <a aria-label="Options" href="?options" target="_blank">
         Settings
      </a>
        &nbsp; and enter a token.
    </div>
  ));
}

App.propTypes = {
  location: shape({
    search: string,
  }).isRequired,
};

export default withRouter(App);
