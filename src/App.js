import React from 'react';
import { withRouter } from 'react-router';
import { shape, string } from 'prop-types';

import SearchInput from './components/SearchInput/SearchInput';
import Options from './components/Options/Options';

const App = ({ location }) => (location.search.indexOf('options') > 0 ? (<Options />) : (<SearchInput />));

App.propTypes = {
  location: shape({
    search: string,
  }).isRequired,
};

export default withRouter(App);
