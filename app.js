const mineflayer = require('mineflayer')
const {pathfinder, Movements, goals: {GoalNear, GoalBlock, GoalFollow}} = require('mineflayer-pathfinder')
const fs = require('fs')
const autoeat = require('mineflayer-auto-eat').plugin

class BotLogic {
    constructor(bot) {
        this.bot = bot
    }

    chat_reaction = (u_name, message) => {
        this.bot.autoEat.disabled = false
        switch (message) {
            case 'ливни с позором':
                this.bot.quit()
                break
        }
    }

    spawn_function = () => {
        this.bot.chat('activated')
        const CommandorFilter = e => e.type === 'player' && commandor === e.username
        const player = this.bot.nearestEntity(CommandorFilter)
        if (player) {
            this.bot.pathfinder.setGoal(new GoalFollow(player, 1), true)
        }
        else{
            this.bot.pathfinder.stop()
        }
        setInterval(() => {
            const AttakFilter = e => !(e.username === commandor) && names.indexOf(e.username) === -1 && friends.indexOf(e.username) === -1 && (e.type === 'player' || e.type === 'mob')
            const attak = this.bot.nearestEntity(AttakFilter)

            if (attak && !this.bot.pathfinder.isMining() && !this.bot.pathfinder.isBuilding()) {
                const sword = this.bot.inventory.items().find(item => item.name.includes('sword'))
                if (sword) this.bot.equip(sword, 'hand')
                const pos = attak.position
                this.bot.lookAt(pos)
                this.bot.attack(attak)
            }

            const CommandorFilter = e => e.type === 'player' && commandor === e.username
            const player = this.bot.nearestEntity(CommandorFilter)
            if (!player){
                this.bot.pathfinder.stop()
                this.#research()
            }
        }, 700)
    }
    #research = () => {
        setInterval(() => {
            const CommandorFilter = e => e.type === 'player' && commandor === e.username
            const player = this.bot.nearestEntity(CommandorFilter)
            if (player) {
                this.bot.pathfinder.setGoal(new GoalFollow(player, 1), true)
                clearInterval(this)
            }
            else{
                console.log(this.bot.entity.position)
            }
        }, 1000)
    }
}

async function run(name, host, port) {
    const options = {
        host: host,
        port: port,
        username: name
    }

    this.bot = mineflayer.createBot(options)

    this.bot.loadPlugin(pathfinder)
    this.bot.loadPlugin(autoeat)

    const bot_logic = new BotLogic(bot)

    this.bot.once('spawn', bot_logic.spawn_function)
    this.bot.on('chat', bot_logic.chat_reaction)
    this.bot.on('error', err=> console.log(err))
}


let bots = []
let file = JSON.parse(fs.readFileSync('army_settings.json', 'utf-8'))
let names = file.names
let commandor = file.commandor
let friends = file.friends


for (let i = 0; i < file.names.length; i++) {
    bots.push(run(file.names[i], file.server_host, file.server_port))
    console.log(`${file.names[i]} ready`)
}
Promise.all(bots)