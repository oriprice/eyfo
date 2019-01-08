import React, { Component } from 'react';

import { setInStorage, getFromStorage } from '../../utils/storageUtils';
import DynamicList from '../DynamicList/DynamicList';

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
      <div>
        <DynamicList
          addOrg={this.addOrg}
          removeOrg={this.removeOrg}
          organizations={organizations}
        />
      </div>
    );
  }
}

export default Options;
