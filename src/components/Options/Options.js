/* globals _gaq window */
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
    };
    this.addOrg = this.addOrg.bind(this);
    this.removeOrg = this.removeOrg.bind(this);
  }

  async componentDidMount() {
    _gaq.push(['_trackPageview']);
    let organizations = await getFromStorage('organizations');
    if (!organizations) {
      organizations = await this.importOrganizations();
    }
    const token = await getFromStorage('token');
    this.setState({ organizations, token });
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
    const { organizations, loading, token } = this.state;

    return (
      <div className={classnames(styles.card, 'card')}>
        <h1 className={classnames(styles.cardTitle, 'card-title')}>Settings</h1>
        <div className={classnames(styles.cardBody, 'card-body')}>
          <div className={styles.tokenWrapper}>
            <div className={styles.accessTokenTitle}>
              <h3>Github Access Token</h3>
              <button
                type="button"
                className={styles.tokenButton}
                disabled={!token}
                onClick={() => window.open('https://github.com/settings/tokens/new?scopes=repo&description=Eyfo%20browser%20extension', '_blank')}
              >
                <i className="fa fa-2x fa-plus-circle" />
              </button>
            </div>
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
            <button type="button" className={token ? styles.importButton : styles.importButtonDisabled} disabled={!token} onClick={() => this.importOrganizations()}>Import Organizations</button>
          </div>
        </div>
      </div>
    );
  }
}

export default Options;
