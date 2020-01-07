/* global window _gaq */
import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import FunniesComponent from 'funnies/dist/react';
import classnames from 'classnames';

import { setInStorage, getFromStorage } from '../../utils/storageUtils';
import getUserOrganizations from '../../utils/organizationsUtils';
import tabUtils from '../../utils/tabUtils';
import styles from './SearchInput.scss';
import './searchInput.css';

const getSuggestions = (value, options) => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return !options || inputLength === 0 ? []
    : Object.keys(options).filter((option) => option.toLowerCase().includes(inputValue));
};

class SearchInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      suggestions: [],
      global: false,
    };
  }

  async componentDidMount() {
    _gaq.push(['_trackPageview']);
    this.options = await getFromStorage('options') || {};
    this.organizations = await getFromStorage('organizations');
    if (!this.organizations) {
      this.organizations = await getUserOrganizations();
      await setInStorage({ organizations: this.organizations });
    }

    const global = await getFromStorage('global') || false;
    this.setState({ global });
  }

  onSuggestionSelected = (event, { suggestion }) => {
    event.preventDefault();
    this.setState({ value: suggestion }, () => this.onFormSubmit(event));
  };

  removeFromCache = async (suggestion) => {
    const { value } = this.state;
    delete this.options[suggestion];
    await setInStorage({ options: this.options });
    this.setState({
      suggestions: getSuggestions(value, this.options),
    });
  };

  renderSuggestion = (suggestion) => (
    <div>
      {suggestion}
      <div
        className={styles.trash}
        onClick={async (e) => {
          e.stopPropagation();
          await this.removeFromCache(suggestion);
        }}
      >
        <i className="fa fa-times" />
      </div>
    </div>
  );

  renderInputComponent = (inputProps) => {
    const { global } = this.state;
    return (
      <div
        className={styles.inputContainer}
        onKeyDown={(e) => {
          this.setState({ error: null, loading: false });
          if (e.keyCode === 9) {
            this.setState({ global: !global },
              () => setInStorage({ global: !global }));
            if (e.preventDefault) {
              e.preventDefault();
              return false;
            }
          }
          return true;
        }}
      >
        <i className={classnames(styles.icon, 'fas', 'fa-search')} />
        {global && (<span className={styles.label}>Global</span>)}
        <input
          autoFocus
          className={styles.input}
          {...inputProps}
        />
      </div>
    );
  };

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue,
    });
  };

  onFormSubmit = async (e) => {
    const { token } = this.props;
    const { value, global } = this.state;
    const urlPatternToReplace = /\/blob(\/[a-z0-9]*)/;
    const urlStringReplacement = '/tree/master';

    e.preventDefault();
    this.setState({
      loading: true,
    });

    const url = this.options[value];
    if (url) {
      tabUtils.openTab(url);
      window.close();
    }
    let matches;
    let navigateToUrl;
    try {
      if (global) {
        const response = await axios.get(encodeURI(`https://api.github.com/search/repositories?order=desc&q=${value}`));
        matches = response.data.items;
      } else if (this.organizations && this.organizations.length > 0) {
        const queryPromises = this.organizations.map((organization) => axios.get(
          encodeURI(`https://api.github.com/search/code?q=org:${organization}+filename:package.json+" name ${value} "+in:file`),
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        ));
        const results = await Promise.all(queryPromises);
        matches = results.map((result) => result.data.items)
          .reduce((previous, current) => previous.concat(current), []);
        matches = matches.sort((a, b) => b.score - a.score);
      }
      if (matches && matches.length > 0) {
        navigateToUrl = matches[0].html_url
          .replace(urlPatternToReplace, urlStringReplacement).replace('/package.json', '');
        await setInStorage({ options: { ...this.options, [value]: navigateToUrl } });
      }

      if (navigateToUrl) {
        tabUtils.openTab(navigateToUrl);
        window.close();
      }
    } finally {
      this.setState({
        error: `Oh no, package not found.
              <br />
              <a href="https://www.google.com/search?q=${value}" target="_blank">Google it for you?</a>`,
      });
    }
    return null;
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value, this.options),
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  render() {
    const {
      value, suggestions, loading, error,
    } = this.state;
    const inputProps = {
      placeholder: 'Search Dependency',
      value,
      onChange: this.onChange,
    };

    return (
      <div className={styles.wrapper}>
        <form onSubmit={this.onFormSubmit}>
          <Autosuggest
            suggestions={suggestions}
            highlightFirstSuggestion
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={(suggestion) => suggestion}
            renderSuggestion={this.renderSuggestion}
            inputProps={inputProps}
            renderInputComponent={this.renderInputComponent}
            onSuggestionSelected={this.onSuggestionSelected}
            focusInputOnSuggestionClick={false}
          />
          <small className="form-text text-muted">
            Use
            <b> TAB </b>
            to toggle between global and private search
          </small>
          {loading && !error && (
            <div className={styles.loading}>
              <div className={styles.spinner}>
                <i className="fa fa-2x fa-spinner fa-spin" />
              </div>
              <div className={styles.funniesWrapper}>
                <FunniesComponent interval={3000} />
              </div>
            </div>
          )}
          {error && (
            <div className={styles.error} dangerouslySetInnerHTML={{ __html: error }} />
          )}
        </form>
      </div>
    );
  }
}

export default SearchInput;

SearchInput.propTypes = {
  token: PropTypes.string.isRequired,
};
