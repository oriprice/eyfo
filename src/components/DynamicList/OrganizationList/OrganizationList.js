import React from 'react';
import { arrayOf, func, string } from 'prop-types';
import styles from './OrganizationList.scss';

const OrganizationList = ({ organizations, removeOrg }) => (
  <div className={styles.container}>
    <ul className={styles.listGroup}>
      {
          organizations.map(orgName => (
            <li className={styles.listItem}>
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

OrganizationList.propTypes = {
  removeOrg: func.isRequired,
  organizations: arrayOf(string).isRequired,
};

export default OrganizationList;
