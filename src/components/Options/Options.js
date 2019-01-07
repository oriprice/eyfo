import React, { Component } from 'react';

import { setInStorage, getFromStorage } from '../../utils/srotageUtils';
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
    this.setState({
      organizations: [...organizations, orgName],
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
