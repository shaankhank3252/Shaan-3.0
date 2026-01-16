const axios = require('axios');

async function getFacebookUid(link) {
  try {
    const response = await axios.get(`https://id.traodoisub.com/api.php?link=${encodeURIComponent(link)}`);
    if (response.data && response.data.id) {
      return response.data.id;
    }
    throw new Error('Could not retrieve UID');
  } catch (error) {
    throw new Error('Failed to get Facebook UID: ' + error.message);
  }
}

module.exports = { getFacebookUid };
