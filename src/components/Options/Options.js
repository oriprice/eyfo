import React, { Component } from 'react';
import classnames from 'classnames';

import { setInStorage, getFromStorage } from '../../utils/storageUtils';
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
    const organizations = await getFromStorage('organizations');
    this.setState({ organizations: organizations || [] });
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

  render() {
    const { organizations } = this.state;
    return (
      <div className={classnames(styles.card, 'card')}>
        <h1 className={classnames(styles.cardTitle, 'card-title')}>Github Organizations</h1>
        <div className={classnames(styles.cardBody, 'card-body')}>
          <DynamicList
            addOrg={this.addOrg}
            removeOrg={this.removeOrg}
            organizations={organizations}
          />
        </div>
      </div>
    );
  }
}

export default Options;
