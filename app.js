const mineflayer = require('mineflayer');
const {pathfinder, Movements, goals: {GoalNear, GoalBlock, GoalFollow}} = require('mineflayer-pathfinder');
const fs = require('fs');
const autoeat = require('mineflayer-auto-eat').plugin;
const autoreg = require('mineflayer-auto-auth');
const armorManager = require('mineflayer-armor-manager');

class BotLogic {
    constructor(bot) {
        this.bot = bot;
        this.AttakMob = e => !(e.username === commandor) && names.indexOf(e.username) === -1 && friends.indexOf(e.username) === -1 && e.mobType !== "Item";
        this.AttakPlayer = e => !(e.username === commandor) && names.indexOf(e.username) === -1 && friends.indexOf(e.username) === -1 && e.type === 'player';
    }

    chat_reaction = (u_name, message) => {
        this.bot.autoEat.disabled = false;
        switch (message) {
            case 'ливни с позором':
                this.bot.quit();
                break;
        }
    }

    spawn_function = () => {
        this.bot.armorManager.equipAll();
        const CommandorFilter = e => e.type === 'player' && commandor === e.username;
        const player = this.bot.nearestEntity(CommandorFilter);
        console.log(`${this.bot.entity.username} activated`);

        if (player) {
            this.bot.pathfinder.setGoal(new GoalFollow(player, 1), true);
        }
        else{
            this.bot.pathfinder.stop();
        }
        setInterval(() => {

            let attak = this.bot.nearestEntity(this.AttakMob);

            if (this.bot.nearestEntity(this.AttakPlayer)) {
                attak = this.bot.nearestEntity(this.AttakPlayer);
            }

            if (attak && !this.bot.pathfinder.isMining() && !this.bot.pathfinder.isBuilding() && this.bot.entity.position.distanceTo(attak.position) <= 5) {
                const sword = this.bot.inventory.items().find(item => item.name.includes('sword'))
                if (sword) this.bot.equip(sword, 'hand');
                const pos = attak.position;
                this.bot.lookAt(pos);
                if(attak.isValid) this.bot.attack(attak);
            }

            const CommandorFilter = e => e.type === 'player' && commandor === e.username;
            const player = this.bot.nearestEntity(CommandorFilter);
            if (!player){
                this.bot.pathfinder.stop();
                this.#research();
            }
            this.bot.armorManager.equipAll();
        }, 700)
    }
    #research = () => {
        setInterval(() => {
            const CommandorFilter = e => e.type === 'player' && commandor === e.username;
            const player = this.bot.nearestEntity(CommandorFilter);
            if (player) {
                this.bot.pathfinder.setGoal(new GoalFollow(player, 1), true);
                clearInterval(this);
            }
            else{
                this.bot.chat("/tpa gimonchik");
                console.log(this.bot.entity.position);
            }
        }, 1000);
    };
}

async function run(name, host, port) {
    const options = {
        host: host,
        port: port,
        username: name,
        AutoAuth: 'password',
        version: version
    };

    this.bot = mineflayer.createBot(options);

    this.bot.loadPlugin(pathfinder);
    this.bot.loadPlugin(autoeat);
    this.bot.loadPlugin(autoreg);
    this.bot.loadPlugin(armorManager);

    const bot_logic = new BotLogic(bot);

    this.bot.once('spawn', bot_logic.spawn_function);
    this.bot.on('chat', bot_logic.chat_reaction);
    bot.on('kicked', (reason, loggedIn) => console.log(reason, loggedIn))
    bot.on('error', err => console.log(err))
}


let bots = [];
let file = JSON.parse(fs.readFileSync('army_settings.json', 'utf-8'));
let names = file.names;
let commandor = file.commandor;
let friends = file.friends;
let version = file.version;


for (let i = 0; i < file.names.length; i++) {
    bots.push(run(file.names[i], file.server_host, file.server_port));
}
Promise.all(bots);