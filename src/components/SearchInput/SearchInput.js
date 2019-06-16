/* global window _gaq */
import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import FunniesComponent from 'funnies/dist/react';
import axios from 'axios';
import classnames from 'classnames';

import { setInStorage, getFromStorage } from '../../utils/storageUtils';
import getUserOrganizations from '../../utils/organizationsUtils';

import styles from './SearchInput.scss';
import './searchInput.css';
import tabUtils from '../../utils/tabUtils';

const getSuggestions = (value, options) => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return !options || inputLength === 0 ? []
    : Object.keys(options).filter(option => option.toLowerCase().includes(inputValue));
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

  renderSuggestion = suggestion => (
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

  search = (url, searchPattern, urlPattern,
    urlPatternToReplace, urlPatternReplacement,
    packageName) => new Promise(async (resolve, reject) => {
    try {
      let pageIndex = 1;
      let response = { data: '' };
      let pagedUrl = url.slice();
      while (pageIndex <= 5
        && !/<div class="code-list">\s*<\/div>/.test(response.data)
        && !/We couldn’t find any code matching/.test(response.data)) {
        response = await axios.get(pagedUrl, {
          validateStatus(status) {
            return status >= 200 && status < 300; // default
          },
        });
        const index = searchPattern[Symbol.search](response.data);
        if (index >= 0) {
          response.data = response.data.slice(Math.max(0, index - 300), index);
          const urlPatternResult = urlPattern[Symbol.match](response.data);
          if (urlPatternResult) {
            const navigateTourl = urlPatternResult.slice(-1)[0]
              .replace(urlPatternToReplace, urlPatternReplacement);
            await setInStorage({ options: { ...this.options, [packageName]: navigateTourl } });
            resolve({ url: navigateTourl });
          }
        }
        pagedUrl = pagedUrl.replace(`p=${pageIndex}`, `p=${pageIndex + 1}`);
        pageIndex += 1;
      }

      resolve();
    } catch (e) {
      reject(e);
    }
  });

  onFormSubmit = async (e) => {
    const { value, global } = this.state;
    const packageName = value.slice().replace(/@(.*)\//, '');
    const searchPatternWithOrg = new RegExp(`name<span class="pl-pds">&quot;</span></span>: <span class="pl-s"><span class="pl-pds">&quot;</span>(@(.*)/)?<span class='text-bold'>${packageName}</span>`);
    const searchPattern = new RegExp(`<span class="text-bold">${packageName}</span>`, 'g');
    const searchPatternForPom = new RegExp(`<span class="(.)*">${packageName}</span>`);
    const urlPatternToFind = /\/.*\/(?=package.json)/;
    const urlPatternToReplace = /\/blob(\/[a-z0-9]*){1}/;
    const urlStringReplacement = '/tree/master';

    e.preventDefault();
    this.setState({
      loading: true,
    });

    const url = this.options[packageName];
    if (url) {
      tabUtils.openTab(url);
      window.close();
    }

    let searchResult;
    try {
      if (global) {
        searchResult = await this.search(`https://github.com/search?q=${packageName}&o=desc&s=stars`,
          searchPattern,
          /href=".*"/,
          /^href="|"$/g,
          '',
          packageName);
      } else if (this.organizations && this.organizations.length > 0) {
        for (let i = 0; i < this.organizations.length; i += 1) {
          searchResult = await this.search(`https://github.com/search?p=1&q=${packageName}+org:${this.organizations[i]}+filename:package.json+in:file&type=Code`,
            searchPatternWithOrg,
            urlPatternToFind,
            urlPatternToReplace,
            urlStringReplacement,
            packageName);
          if (searchResult) {
            break;
          }
          searchResult = await this.search(`https://github.com/search?p=1&q=${packageName}+org:${this.organizations[i]}+filename:pom.xml+in:file&type=Code`,
            searchPatternForPom,
            /\/.*\/(?=pom.xml)/,
            urlPatternToReplace,
            urlStringReplacement,
            packageName);
          if (searchResult) {
            break;
          }
        }
      } else {
        this.setState({
          error: `You should add <a href='?options' target="_blank">Organizations</a>.
              <br />
             Or hit TAB to search globally`,
        });
      }
      if (searchResult && searchResult.url) {
        tabUtils.openTab(searchResult.url);
        window.close();
      }

      this.setState({
        error: `Oh no, package not found.
              <br />
              <a href="https://www.google.com/search?q=${packageName}" target="_blank">Google it for you?</a>`,
      });
    } catch (error) {
      this.setState({
        error: `${error.message}First, sign in to <a href="https://www.github.com" target="_blank">GitHub</a>
        <br />
        Then, unleash me..`,
      });
    }
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
            getSuggestionValue={suggestion => suggestion}
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
