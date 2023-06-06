const chalk = require('chalk');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const requireFromString = require('require-from-string');

const makeRequest = require('./functions.js');

let registeredValues = {};

console.log("Bem-vindo ao Command GPT desenvolvido por Tihh Gonçalves\n");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let app;

function askQuestion() {
    rl.question(chalk.green(' → Qual aplicação deseja rodar? '), (answer) => {
        const filePath = path.join(__dirname, 'apps', `${answer}.json`);
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.log(chalk.red(`O arquivo ${filePath} não existe.`));
                askQuestion();
            } else {
                console.log(chalk.green(' → Ok, carregando aplicação...\n'));
                app = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                console.log(chalk.white('Nome da Aplicação: ') + chalk.cyan(`${app.nome}`));
                console.log(chalk.white('Descrição: ') + chalk.cyan(`${app.descricao}`));
                console.log('\nComandos:');
                app.comandos.forEach((comando, index) => {
                    console.log(chalk.cyan(`  ${index + 1}. ${comando.descricao}`));
                });
                rl.question(chalk.yellow('\nPodemos começar agora? (S = Sim e N = Não)\n'), (response) => {
                    if (response.toUpperCase() === 'S') {
                        executeCommands(0);
                    } else {
                        console.log('Ok, talvez na próxima vez.');
                        rl.close();
                    }
                });
            }
        });
    });
}

async function executeCommands(commandIndex) {
    if (commandIndex < app.comandos.length) {
        const comando = app.comandos[commandIndex];
        if (comando.variaveis && comando.variaveis.length > 0) {
            askVariables(comando.variaveis, 0, {}, (answers) => {
                console.log(chalk.green(`\nExecutando: ${comando.descricao}...`));
                comando.variaveis.forEach((variavel) => {
                    console.log(chalk.white(`  Iniciando...`));
                    if (variavel.exec) {
                        const execFunction = requireFromString(fs.readFileSync(path.join(__dirname, 'execs', `${variavel.exec}.js`), 'utf8'));
                        let params = [];
                        if (comando.vars && typeof comando.vars === 'object') {
                            params = Object.entries(comando.vars).map(([key, value]) => {
                                if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
                                    value = value.slice(1, -1); // remove the braces
                                    return registeredValues[value];
                                } else {
                                    return value;
                                }
                            });
                        }
                        const execResult = await execFunction(...params);
                        if (execResult === 'erro') {
                            console.error(chalk.red(`Erro na execução do comando: ${comando.descricao}`));
                            throw new Error(`Erro na execução do comando: ${comando.descricao}`);
                        } else {
                            console.log(chalk.green(`  Ok!`));
                            if (comando.id) {
                                registeredValues[comando.id] = execResult;
                            }
                        }
                    }
                });
                executeCommands(commandIndex + 1);
            });
        } else {
            console.log(chalk.green(`\nExecutando: ${comando.descricao}...`));
            if (comando.exec) {
                console.log(chalk.white(`  Iniciando...`));
                const execFunction = requireFromString(fs.readFileSync(path.join(__dirname, 'execs', `${comando.exec}.js`), 'utf8'));
                let params = [];
                if (comando.vars && typeof comando.vars === 'object') {
                    params = Object.entries(comando.vars).map(([key, value]) => {
                        if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
                            value = value.slice(1, -1); // remove the braces
                            return registeredValues[value];
                        } else {
                            return value;
                        }
                    });
                }
                const execResult = execFunction(...params);
                if (execResult === 'erro') {
                    console.error(chalk.red(`Erro na execução do comando: ${comando.descricao}`));
                    throw new Error(`Erro na execução do comando: ${comando.descricao}`);
                } else {
                    console.log(chalk.green(`  Ok!`));
                    if (comando.id) {
                        registeredValues[comando.id] = execResult;
                    }
                }
            }
            executeCommands(commandIndex + 1);
        }
    } else {
        console.log(chalk.green('\nObrigado! Agora vamos executar as respostas e rodar os prompts...'));
        rl.close();
    }
}

async function askVariables(variaveis, variableIndex, answers, callback) {
    if (variableIndex < variaveis.length) {
        const variavel = variaveis[variableIndex];
        rl.question(chalk.cyan(`\n${variavel.pergunta}\n`), (answer) => {
            const validationFunction = requireFromString(fs.readFileSync(path.join(__dirname, 'execs', `${variavel.exec}.js`), 'utf8'));
            const validationResult = await validationFunction(answer);
            if (validationResult === 'erro') {
                console.log(chalk.red(`Erro na validação do comando: ${variavel.nome}`));
                rl.close();
            } else {
                answers[variavel.nome] = validationResult;
                if (variavel.id) {
                    registeredValues[variavel.id] = validationResult;
                }
                askVariables(variaveis, variableIndex + 1, answers, callback);
            }
        });
    } else {
        callback(answers);
    }
}

askQuestion();