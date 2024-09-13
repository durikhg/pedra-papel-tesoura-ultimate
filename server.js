const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let players = [];
let choices = {};

wss.on('connection', function connection(ws) {
    players.push(ws);
    
    if (players.length === 2) {
        // Se dois jogadores estiverem conectados, informar que o jogo pode começar
        players.forEach(player => player.send(JSON.stringify({ status: 'ready' })));
    }

    ws.on('message', function incoming(message) {
        const playerIndex = players.indexOf(ws);
        const opponentIndex = playerIndex === 0 ? 1 : 0;
        
        // Armazenar a escolha do jogador
        choices[playerIndex] = message;

        // Quando ambos os jogadores fizerem suas escolhas, calcular o resultado
        if (choices[0] && choices[1]) {
            const result = calculateResult(JSON.parse(choices[0]), JSON.parse(choices[1]));

            // Enviar o resultado para ambos os jogadores
            players[0].send(JSON.stringify({ status: 'result', result: result[0], opponentChoice: JSON.parse(choices[1]) }));
            players[1].send(JSON.stringify({ status: 'result', result: result[1], opponentChoice: JSON.parse(choices[0]) }));
            
            // Resetar as escolhas para o próximo jogo
            choices = {};
        }
    });

    ws.on('close', function () {
        players = players.filter(player => player !== ws);
        choices = {}; // Limpar as escolhas se um jogador sair
    });
});

// Função para calcular o resultado baseado nas escolhas dos dois jogadores
function calculateResult(choice1, choice2) {
    const winConditions = {
        "Tesoura": ["Papel", "Esponja", "Lobo", "Árvore", "Humano", "Cobra"],
        "Pedra": ["Tesoura", "Esponja", "Lobo", "Árvore", "Humano", "Cobra", "Fogo"],
        "Papel": ["Pedra", "Arma", "Raio", "Diabo", "Dragão", "Água", "Ar"],
        "Arma": ["Pedra", "Tesoura", "Lobo", "Árvore", "Humano", "Cobra", "Fogo"],
        "Raio": ["Pedra", "Tesoura", "Arma", "Árvore", "Humano", "Cobra", "Fogo"],
        "Diabo": ["Pedra", "Tesoura", "Arma", "Raio", "Humano", "Cobra", "Fogo", "Dragão"],
        "Dragão": ["Pedra", "Tesoura", "Arma", "Raio", "Diabo", "Humano", "Cobra", "Fogo"],
        "Água": ["Pedra", "Tesoura", "Arma", "Raio", "Diabo", "Dragão", "Fogo"],
        "Ar": ["Pedra", "Fogo", "Arma", "Raio", "Diabo", "Dragão", "Água"],
        "Esponja": ["Água", "Arma", "Raio", "Diabo", "Dragão", "Ar", "Papel"],
        "Lobo": ["Água", "Raio", "Diabo", "Dragão", "Ar", "Papel", "Esponja"],
        "Árvore": ["Diabo", "Dragão", "Ar", "Papel", "Esponja", "Lobo", "Água"],
        "Humano": ["Água", "Dragão", "Ar", "Papel", "Esponja", "Lobo", "Árvore"],
        "Cobra": ["Água", "Ar", "Papel", "Esponja", "Lobo", "Árvore", "Humano"],
        "Fogo": ["Tesoura", "Papel", "Esponja", "Lobo", "Árvore", "Humano", "Cobra"]
    };

    if (choice1 === choice2) {
        return ["Empate", "Empate"];
    }

    if (winConditions[choice1].includes(choice2)) {
        return ["Você ganhou!", "Você perdeu!"];
    } else {
        return ["Você perdeu!", "Você ganhou!"];
    }
}
