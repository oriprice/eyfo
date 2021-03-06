/* globals _gaq */
import React, { Component } from 'react';
import classnames from 'classnames';

import { setInStorage, getFromStorage } from '../../utils/storageUtils';
import getUserOrganizations from '../../utils/organizationsUtils';
import DynamicList from '../DynamicList/DynamicList';
import styles from './Options.scss';

class Options extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organizations: [],
      token: '',
      cleared: false,
      options: {},
    };
    this.addOrg = this.addOrg.bind(this);
    this.removeOrg = this.removeOrg.bind(this);
  }

  async componentDidMount() {
    _gaq.push(['_trackPageview']);
    const token = await getFromStorage('token');
    let organizations = await getFromStorage('organizations') || [];
    const options = await getFromStorage('options') || [];
    if (!organizations && token) {
      organizations = await this.importOrganizations();
    }

    this.setState({ organizations, token, options });
  }

  onDragStart(e, index) {
    const { organizations } = this.state;
    this.draggedItem = organizations[index];
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.parentNode);
    e.dataTransfer.setDragImage(e.target.parentNode, 20, 20);
  }

  onDragOver(index) {
    const { organizations } = this.state;
    this.draggedOverItem = organizations[index];

    // if the item is dragged over itself, ignore
    if (this.draggedItem === this.draggedOverItem) {
      return;
    }

    // filter out the currently dragged item
    const currentItems = organizations.filter((item) => item !== this.draggedItem);

    // add the dragged item after the dragged over item
    currentItems.splice(index, 0, this.draggedItem);

    this.setState({ organizations: currentItems }, async () => {
      await setInStorage({ organizations: currentItems });
    });
  }

  onDragEnd() {
    this.draggedItem = null;
  }

  addOrg(orgName) {
    let { organizations } = this.state;
    let arrayOfOrgs = [orgName];
    const isCSV = orgName.includes(',');
    if (isCSV) {
      arrayOfOrgs = orgName.split(',');
    }

    arrayOfOrgs.forEach((org) => {
      const trimmedOrgName = org.trim();
      if (!organizations.includes(trimmedOrgName)) {
        organizations = [...organizations, trimmedOrgName];
      }
    });

    this.setState({
      organizations,
    }, () => {
      setInStorage({ organizations } = this.state);
    });
  }

  async importOrganizations() {
    const { token } = this.state;
    this.setState({ loading: true });
    const organizations = await getUserOrganizations(token);
    return new Promise((resolve) => {
      this.setState({
        organizations,
        loading: false,
      }, () => {
        setInStorage({ organizations });
        resolve();
      });
    });
  }

  async removeOrg(orgName) {
    let organizations = await getFromStorage('organizations');
    this.setState({
      organizations: organizations.filter((org) => org !== orgName),
    }, async () => {
      await setInStorage({ organizations } = this.state);
    });
  }

  render() {
    const {
      organizations, loading, token, cleared, options,
    } = this.state;

    return (
      <div className={classnames(styles.card, 'card')}>
        <h1 className={classnames(styles.cardTitle, 'card-title')}>Settings</h1>
        <div className={classnames(styles.cardBody, 'card-body')}>
          <div className={styles.tokenWrapper}>
            <div className={styles.accessTokenTitle}>
              <h3>
                Github Access Token
                <span className={styles.help}>
                  <i className="far fa-question-circle" aria-hidden="true" onClick={() => window.open('https://github.com/oriprice/eyfo/blob/master/README.md#access-token', '_blank')} />
                </span>
              </h3>
            </div>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                value={token}
                onChange={(e) => {
                  this.setState({ token: e.target.value });
                  setInStorage({ token: e.target.value });
                }}
                className={styles.formControl}
                placeholder="Add Personal Access Token"
              />
              <button
                type="button"
                className={styles.button}
                onClick={() => window.open('https://github.com/settings/tokens/new?scopes=repo&description=Eyfo%20Browser%20Extension', '_blank')}
              >
               Generate
              </button>
            </div>
            <small className="form-text text-muted">
              Token will be stored in browsers local storage
            </small>
          </div>
          <hr />
          {loading
            ? (<div className={styles.loading}><i className="fa fa-spinner fa-pulse fa-3x fa-fw" /></div>)
            : (
              <DynamicList
                addOrg={this.addOrg}
                removeOrg={this.removeOrg}
                organizations={organizations}
                onDragStart={(e, index) => this.onDragStart(e, index)}
                onDragEnd={() => this.onDragEnd()}
                onDragOver={(index) => this.onDragOver(index)}
              />
            )}
          <div className={styles.buttonWrapper}>
            <div className={styles.divider}><span>OR</span></div>
            <div className={styles.tooltip}>
              <button type="button" className={token ? styles.importButton : styles.importButtonDisabled} disabled={!token} onClick={() => this.importOrganizations()}>Import Organizations</button>
              {!token && (
              <span className={styles.tooltipText}>
                Token is required to fetch organizations
              </span>
              )}
            </div>
          </div>
          <hr />
          <div>
            <h3>
              Advanced
            </h3>
            <div className={styles.advancedWrapper}>
              {`Clear ${Object.keys(options).length} cached results`}
              <button
                type="button"
                className={styles.button}
                onClick={async () => {
                  await setInStorage({ options: {} });
                  this.setState({ cleared: true, options: {} });
                  setTimeout(() => { this.setState({ cleared: false }); }, 3000);
                }}
              >
                Clear
              </button>
              &nbsp;
              {cleared && 'Cleared!'}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Options;
