import React, { Component } from 'react';
import { arrayOf, func, string } from 'prop-types';
import styles from './OrganizationList.scss';

class OrganizationList extends Component {
  state={
    draggingOverIndex: -1,
  };

  render() {
    const {
      organizations, removeOrg, onDragStart, onDragEnd, onDragOver,
    } = this.props;
    const { draggingOverIndex } = this.state;
    return (
      <div className={styles.container}>
        <ul className={styles.listGroup}>
          {
            organizations.map((orgName, index) => (
              <li
                style={{ margin: index === draggingOverIndex ? '10px' : '0', visibility: index === draggingOverIndex ? 'hidden' : 'visible' }}
                className={styles.listItem}
                draggable
                onDragOver={() => {
                  this.setState({
                    draggingOverIndex: index,
                  }, () => onDragOver(index));
                }}
                onDragStart={e => onDragStart(e, index)}
                onDragEnd={() => {
                  this.setState({
                    draggingOverIndex: -1,
                  }, () => onDragEnd());
                }}
              >
                {orgName}
                <div
                  className={styles.trash}
                  onClick={() => {
                    removeOrg(orgName);
                  }}
                >
                  <i className="fa fa-times" />
                </div>
              </li>
            ))
          }
        </ul>
      </div>
    );
  }
}

OrganizationList.propTypes = {
  removeOrg: func.isRequired,
  onDragStart: func.isRequired,
  onDragEnd: func.isRequired,
  onDragOver: func.isRequired,
  organizations: arrayOf(string).isRequired,
};

export default OrganizationList;
