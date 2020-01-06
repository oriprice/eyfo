/* global chrome */

import React from 'react';
import { withRouter } from 'react-router';
import { shape, string } from 'prop-types';
import classnames from 'classnames';

import axios from 'axios';
import SearchInput from './components/SearchInput/SearchInput';
import Options from './components/Options/Options';
import styles from './App.scss';

const App = ({ location }) => {
  const CLIENT_ID = '2ae327d86338aa0bcf99';
  const CALLBACK_URL = 'https://njeicfhbikangnnaoahdlcmjhgilihgp.chromiumapp.org?index.html?app';
  const AUTH_URL = `https://github.com/login/oauth/authorize/?client_id=${CLIENT_ID}&redirect_uri=${CALLBACK_URL}&scope=read:org+repo+read:user`;
  const [token, setToken] = React.useState('');

  React.useEffect(() => {
    chrome.identity.launchWebAuthFlow({
      url: AUTH_URL,
      interactive: true,
    }, async (redirectURL) => {
      const urlParams = new URLSearchParams(redirectURL);
      const code = urlParams.get('code');
      const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', { client_id: '2ae327d86338aa0bcf99', client_secret: 'a9786e828ee4f8e6127bd2c34ecca73ddd7bbed4', code });
      setToken(/(?:access_token=)([a-z 0-9]*)/g.exec(tokenResponse.data)[1]);
      console.log(/(?:access_token=)([a-z 0-9]*)/g.exec(tokenResponse.data)[1]);
    });
  }, []);

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
