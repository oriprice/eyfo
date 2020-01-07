import axios from 'axios';

export default async (token) => {
  const result = await axios.get('https://api.github.com/user/orgs', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return result.data.map((org) => org.login);
};
