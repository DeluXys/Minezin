
const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const express = require('express');
const app = express();

let bot;
let home = null; // Armazena a posição da home

// Função para iniciar o bot
function startBot() {
  bot = mineflayer.createBot({
    host: 'oDeluXoff6.aternos.me', // Substitua pelo IP do servidor
    port: 47908,
    username: 'BotZilla', // Nome do bot
  });

  bot.loadPlugin(pathfinder);

  // Evento para quando o bot entra no servidor
  bot.on('spawn', () => {
    console.log('Bot entrou no servidor!');
    bot.chat('Estou online e pronto para comandos!');

    // Anti-kick: Faz o bot pular a cada 60 segundos para não ser desconectado
    setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 500);
    }, 60000);
  });

  // Comandos do chat
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    // Comando para definir home
    if (message === '!sethome') {
      home = bot.entity.position.clone();
      bot.chat('Home definida com sucesso!');
    }

    // Comando para voltar ao home
    if (message === '!home') {
      if (!home) {
        bot.chat('Você ainda não definiu um home.');
        return;
      }

      bot.chat('Voltando para o home...');
      const mcData = require('minecraft-data')(bot.version);
      const defaultMove = new Movements(bot, mcData);
      bot.pathfinder.setMovements(defaultMove);
      bot.pathfinder.setGoal(new goals.GoalBlock(home.x, home.y, home.z));

      bot.once('goal_reached', () => {
        bot.chat('Cheguei no home!');
      });
    }

    // Comando para definir spawn na cama
    if (message === '!setspawn') {
      const cama = bot.findBlock({
        matching: block => block.name.includes('bed'),
        maxDistance: 10,
      });

      if (!cama) {
        bot.chat('Não encontrei nenhuma cama por perto.');
        return;
      }

      bot.chat('Achei uma cama! Indo até ela para definir o spawn...');
      const mcData = require('minecraft-data')(bot.version);
      const defaultMove = new Movements(bot, mcData);
      bot.pathfinder.setMovements(defaultMove);
      bot.pathfinder.setGoal(new goals.GoalBlock(cama.position.x, cama.position.y, cama.position.z));

      bot.once('goal_reached', () => {
        bot.chat('Cheguei na cama! Tentando dormir...');
        bot.sleep(cama, (err) => {
          if (err) {
            bot.chat('Não consegui dormir na cama.');
            console.log(err);
          } else {
            bot.chat('Spawn definido com sucesso! 🛏️');
          }
        });
      });
    }

    // Comando para o bot usar /tp no jogador
    if (message === '!tp') {
      bot.chat(`/tp ${username}`); // O bot usa o comando de tp para o jogador que mandou o comando
    }
  });

  // Reconexão automática se o bot for desconectado
  bot.on('end', () => {
    console.log('Desconectado! Tentando reconectar em 5 segundos...');
    setTimeout(startBot, 5000); // Tenta reconectar após 5 segundos
  });

  bot.on('error', (err) => console.log('Erro: ', err));
}

// Inicia o bot
startBot();

