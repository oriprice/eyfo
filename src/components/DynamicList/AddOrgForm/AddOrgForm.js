import React, { Component } from 'react';
import { func } from 'prop-types';

import styles from './AddOrgForm.scss';

export default class AddOrgForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    const { value } = this.state;
    const { addOrg } = this.props;
    e.preventDefault();
    addOrg(value);
    this.setState({ value: '' });
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  render() {
    const { value } = this.state;
    return (
      <form className={styles.formInline} onSubmit={this.handleClick} action="#">
        <input type="text" value={value} onChange={this.handleChange} className={styles.formControl} placeholder="Organization Name" />
        <button className={styles.hiddenButton} type="submit"><i className="fa fa-2x fa-plus-circle" /></button>
      </form>
    );
  }
}

AddOrgForm.propTypes = {
  addOrg: func.isRequired,
};
