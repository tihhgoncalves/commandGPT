const openai = require('./globals');

async function makeRequest(prompt) {
    try {
        const response = await openai.Completion.create({
            engine: 'text-davinci-004', // Este é o nome do motor GPT-4
            prompt: prompt,
            max_tokens: 60
        });

        return response.data.choices[0].text.strip();
    } catch (error) {
        console.error(error);
    }
}

module.exports = makeRequest;
