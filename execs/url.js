const axios = require('axios');

module.exports = async function(url) {
  let urlString;

  if (typeof url === 'string') {
    urlString = url;
  } else if (typeof url === 'object' && url.url) {
    urlString = url.url;
  } else {
    console.error(`URL inválida: ${url}`);
    return 'erro';
  }

  try {
    const response = await axios.get(urlString);
    if (response.status === 200) {
      return response.data;
    } else {
      console.error(`Erro ao acessar a URL ${urlString}: Status ${response.status}`);
      return 'erro';
    }
  } catch (error) {
    console.error(`Erro ao acessar a URL ${urlString}: ${error.message}`);
    return 'erro';
  }
};
