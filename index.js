const { WebcastPushConnection } = require('tiktok-live-connector')
const express = require('express')

const app = express()
app.use(express.json())

const servers = {}

function makeServer(serverId) {
    if (!servers[serverId]) {
        servers[serverId] = {
            latestData: "",
            currentTikTokUsername: "",
            connection: null
        }
    }

    return servers[serverId]
}

function setLatest(serverId, username, gift, coins = 0) {
    const server = makeServer(serverId)

    server.latestData = JSON.stringify({
        username,
        gift,
        coins,
        id: Date.now()
    })
}

async function connectTikTok(serverId, username) {
    const server = makeServer(serverId)

    server.currentTikTokUsername = username

    if (server.connection) {
        try {
            server.connection.disconnect()
        } catch(e){}
    }

    const connection = new WebcastPushConnection(username)
    server.connection = connection

    connection.connect()
    .then(state => {
        console.log(`Servidor ${serverId} conectado al live de ${state.uniqueId}`)
    })
    .catch(err => {
        console.log(`Error en servidor ${serverId}:`, err.message)
    })

    connection.on('chat', data => {
        setLatest(serverId, data.comment, false, 0)
    })

    connection.on('gift', data => {
        if (data.comment) {
            setLatest(serverId, data.comment, true, data.diamondCount || 1)
        }
    })
}

app.get('/', (req,res)=>{
    res.send("TikTok Roblox Server ON")
})

app.get('/latest/:serverId', (req,res)=>{
    const server = makeServer(req.params.serverId)
    res.send(server.latestData)
})

app.get('/connect/:serverId/:username', async (req,res)=>{
    const serverId = req.params.serverId
    const username = req.params.username.replace("@","").trim()

    if (!username) {
        return res.send("Usuario inválido")
    }

    await connectTikTok(serverId, username)

    res.send(`Server ${serverId} conectando a ${username}`)
})

app.get('/status/:serverId', (req,res)=>{
    const server = makeServer(req.params.serverId)

    res.json({
        online: true,
        tiktokUsername: server.currentTikTokUsername
    })
})

app.get('/test/:serverId', (req,res)=>{
    setLatest(req.params.serverId, "Builderman", false, 0)
    res.send("spawned")
})

app.get('/gift/:serverId', (req,res)=>{
    setLatest(req.params.serverId, "Roblox", true, 1)
    res.send("gift spawned")
})

app.get('/biggift/:serverId', (req,res)=>{
    setLatest(req.params.serverId, "Builderman", true, 50)
    res.send("big gift spawned")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
    console.log("Servidor iniciado")
})
