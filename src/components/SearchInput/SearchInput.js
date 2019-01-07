import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import FunniesComponent from 'funnies/dist/react';
import axios from 'axios';
import classnames from 'classnames';

import { setInStorage, getFromStorage } from '../../utils/srotageUtils';

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
    };
  }

  async componentDidMount() {
    this.options = await getFromStorage('options') || {};
    this.organizations = await getFromStorage('organizations');
  }

  onSuggestionSelected = (event, { suggestion }) => {
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
      <div className={styles.inputContainer}>
        <i className={classnames(styles.icon, 'fas', 'fa-search')} />
        {global && (<span className={styles.label}>Global:</span>)}
        <input
          autoFocus
          className={styles.input}
          {...inputProps}
          onKeyDown={(e) => {
            if (e.keyCode === 9) {
              this.setState({ global: !global });
              if (e.preventDefault) {
                e.preventDefault();
              }
              return false;
            }
            return true;
          }}
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
    urlPatternToReplace, urlPatternReplacement, packageName) => new Promise(async (resolve) => {
    let pageIndex = 1;
    let response = { data: '' };
    let pagedUrl = url.slice();
    while (pageIndex <= 15
      && !/<div class="code-list">\s*<\/div>/.test(response.data)
      && !/We couldn’t find any code matching/.test(response.data)) {
      response = await axios.get(pagedUrl);
      const index = searchPattern[Symbol.search](response.data);
      if (index >= 0) {
        response.data = response.data.slice(index - 300, index);
        const navigateTourl = urlPattern[Symbol.match](response.data).slice(-1)[0]
          .replace(urlPatternToReplace, urlPatternReplacement);
        await setInStorage({ options: { ...this.options, [packageName]: navigateTourl } });
        resolve(tabUtils.openTab(navigateTourl));
      }
      pagedUrl = pagedUrl.replace(`p=${pageIndex}`, `p=${pageIndex + 1}`);
      pageIndex += 1;
    }
    resolve();
  });

  onFormSubmit = async (e) => {
    const { value, global } = this.state;
    const packageName = value.slice().replace(/@(.*)\//, '');
    const searchPatternWithOrg = new RegExp(`name<span class="pl-pds">&quot;</span></span>: <span class="pl-s"><span class="pl-pds">&quot;</span>(@(.*)/)?<em>${packageName}</em><span class="pl-pds">&quot;</span>`);
    const searchPattern = new RegExp(`<em>${packageName}</em>`, 'g');
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
    }

    if (global) {
      await this.search(`https://github.com/search?q=${packageName}`,
        searchPattern,
        /href=".*"/,
        /^href="|"$/g,
        '',
        packageName);
    } else {
      for (let i = 0; i < this.organizations.length; i += 1) {
        await this.search(`https://github.com/search?p=1&q=${packageName}+org%3A${this.organizations[i]}+filename%3Apackage.json+in%3Afile&type=Code`,
          searchPatternWithOrg,
          urlPatternToFind,
          urlPatternToReplace,
          urlStringReplacement,
          packageName);
      }
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
    const { value, suggestions, loading } = this.state;
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
          />
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner}>
                <i className="fa fa-2x fa-spinner fa-spin" />
              </div>
              <div className={styles.funniesWrapper}>
                <FunniesComponent interval={2000} />
              </div>
            </div>
          )}
        </form>
      </div>
    );
  }
}

export default SearchInput;
