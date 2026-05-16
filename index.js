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
            connection: null,
            connected: false,
            lastError: ""
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

    if (server.connection) {
        try { server.connection.disconnect() } catch(e) {}
    }

    server.currentTikTokUsername = username
    server.connected = false
    server.lastError = ""

    const connection = new WebcastPushConnection(username)
    server.connection = connection

    try {
        const state = await connection.connect()

        server.connected = true
        server.lastError = ""

        console.log(`Server ${serverId} conectado a ${state.uniqueId}`)

        connection.on('chat', data => {
            setLatest(serverId, data.comment, false, 0)
        })

        connection.on('gift', data => {
            if (data.comment) {
                setLatest(serverId, data.comment, true, data.diamondCount || 1)
            }
        })

        return {
            ok: true,
            message: `✅ Conectado a @${username}`
        }

    } catch (err) {
        server.connected = false
        server.lastError = err.message || "Error desconocido"

        console.log(`Error conectando ${username}:`, server.lastError)

        return {
            ok: false,
            message: `❌ No se pudo conectar a @${username}: ${server.lastError}`
        }
    }
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
        return res.send("❌ Usuario inválido")
    }

    const result = await connectTikTok(serverId, username)
    res.send(result.message)
})

app.get('/status/:serverId', (req,res)=>{
    const server = makeServer(req.params.serverId)

    res.json({
        connected: server.connected,
        tiktokUsername: server.currentTikTokUsername,
        lastError: server.lastError
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
