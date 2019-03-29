/* globals ga */
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
    };
    this.addOrg = this.addOrg.bind(this);
    this.removeOrg = this.removeOrg.bind(this);
  }

  async componentDidMount() {
    ga('set', 'page', '/options');
    ga('send', 'pageview');
    let organizations = await getFromStorage('organizations');
    if (!organizations) {
      organizations = await this.importOrganizations();
    }
    this.setState({ organizations });
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

  async removeOrg(orgName) {
    let organizations = await getFromStorage('organizations');
    this.setState({
      organizations: organizations.filter(org => org !== orgName),
    }, async () => {
      await setInStorage({ organizations } = this.state);
    });
  }

  async importOrganizations() {
    this.setState({ loading: true });
    return new Promise(async (resolve) => {
      const organizations = await getUserOrganizations();
      this.setState({
        organizations,
        loading: false,
      }, () => {
        setInStorage({ organizations });
        resolve();
      });
    });
  }


  render() {
    const { organizations, loading } = this.state;
    return (
      <div className={classnames(styles.card, 'card')}>
        <h1 className={classnames(styles.cardTitle, 'card-title')}>Github Organizations</h1>
        <div className={classnames(styles.cardBody, 'card-body')}>
          {
        loading
          ? (<div className={styles.loading}><i className="fa fa-spinner fa-pulse fa-3x fa-fw" /></div>)
          : (
            <DynamicList
              addOrg={this.addOrg}
              removeOrg={this.removeOrg}
              organizations={organizations}
            />
          )
      }
          <div className={styles.buttonWrapper}>
            <div className={styles.divider}><span>OR</span></div>
            <button type="button" className={styles.button} onClick={() => this.importOrganizations()}>Import Organizations</button>
          </div>
        </div>
      </div>
    );
  }
}

export default Options;
