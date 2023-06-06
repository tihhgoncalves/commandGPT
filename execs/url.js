const axios = require('axios');

module.exports = async function(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Erro ao acessar a URL ${url}: ${error.message}`);
        return 'erro';
    }
};
