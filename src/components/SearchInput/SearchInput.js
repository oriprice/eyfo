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

  renderInputComponent = (inputProps) => (
    <div
      className={styles.inputContainer}
      onKeyDown={() => {
        this.setState({ error: null, loading: false });
        return true;
      }}
    >
      <i className={classnames(styles.icon, 'fas', 'fa-search')} />
      <input
        autoFocus
        {...inputProps}
      />
    </div>
  );

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue,
    });
  };

  onFormSubmit = async (e) => {
    const { token } = this.props;
    const { value } = this.state;
    const urlPatternToReplace = /\/blob(\/[a-z0-9]*)/;
    const urlStringReplacement = '/tree/master';
    const unscopedPackageName = value.slice().replace(/@(.*)\//, '');

    e.preventDefault();
    this.setState({
      loading: true,
    });

    const url = this.options[value];
    if (url) {
      tabUtils.openTab(url);
      window.close();
    }
    let matches = [];
    let navigateToUrl;
    try {
      if (this.organizations && this.organizations.length > 0) {
        // take only first 5 organizations, github doesnt return accurate result for more
        const organizationsQuery = this.organizations.reduce((prev, current, index) => (index < 5 ? `${prev}org:${current}+` : prev), '');
        const packageJsonPromise = axios.get(
          `https://api.github.com/search/code?q=${organizationsQuery}filename:package.json+" ${encodeURIComponent(`"name": "${value}",`)} "+in:file`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const pomXmlPromise = axios.get(
          `https://api.github.com/search/code?q=${organizationsQuery}filename:pom.xml+"${encodeURIComponent(`<artifactId> ${unscopedPackageName} </artifactId>, `)}"+in:file`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const [resultPomXml, resultPackageJson] = await Promise.all([
          pomXmlPromise, packageJsonPromise,
        ]);
        matches = [...resultPackageJson.data.items, ...resultPomXml.data.items]
          .sort((a, b) => b.score - a.score);
      }
      if (matches.length === 0 || matches[0].score < 50) {
        const sanitizedValue = value.replace('@', '').split('/')[0];
        const resultGlobal = await axios.get(`https://api.github.com/search/repositories?order=desc&q=${encodeURIComponent(sanitizedValue)}`);
        matches = resultGlobal.data.items;
      }

      if (matches && matches.length > 0) {
        navigateToUrl = matches[0].html_url
          .replace(urlPatternToReplace, urlStringReplacement).replace('/package.json', '').replace('pom.xml', '');
        await setInStorage({ options: { ...this.options, [value]: navigateToUrl } });
      }

      if (navigateToUrl) {
        tabUtils.openTab(navigateToUrl);
        window.close();
      }
    } catch (error) {
      if (error.response.status === 403) {
        this.setState({
          error: `You have triggered github abuse mechanism, please retry in ${error.response.headers['retry-after']} seconds`,
        });
      }

      if (error.response.status === 401) {
        this.setState({
          error: 'You are unauthorized, please check/reset your token in the <a href="?options" target="_blank">settings</a> page',
        });
      }
    } finally {
      const { error } = this.state;
      if (!error) {
        this.setState({
          error: `Oh no, package not found.
              <br />
              <a href="https://www.google.com/search?q=${value}" target="_blank">Google it for you?</a>`,
        });
      }
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
