import axios from 'axios';

function getMatches(string, regex, index) {
  const innerIndex = index || 1; // default to the first capturing group
  const matches = [];
  let match = regex.exec(string);
  while (match) {
    matches.push(match[innerIndex]);
    match = regex.exec(string);
  }
  return matches;
}

export default async () => {
  const result = await axios.get('https://github.com/settings/organizations');
  return getMatches(result.data, /(?:<a href="\/.*">)(.*)(?:<\/a>)/g, 1).slice(1);
};
