const { WebcastPushConnection } = require('tiktok-live-connector')
const express = require('express')

const app = express()
app.use(express.json())

let latestData = ""
let currentTikTokUsername = ""
let tiktokLiveConnection = null

function setLatest(username, gift, coins = 0) {
    latestData = JSON.stringify({
        username,
        gift,
        coins,
        id: Date.now()
    })
}

async function connectTikTok(username) {

    currentTikTokUsername = username

    if (tiktokLiveConnection) {
        try {
            tiktokLiveConnection.disconnect()
        } catch(e){}
    }

    tiktokLiveConnection = new WebcastPushConnection(username)

    tiktokLiveConnection.connect()
    .then(state => {
        console.log(`Conectado al live de ${state.uniqueId}`)
    })
    .catch(err => {
        console.log(err)
    })

    tiktokLiveConnection.on('chat', data => {

        setLatest(
            data.comment,
            false,
            0
        )

    })

    tiktokLiveConnection.on('gift', data => {

        if(data.comment){

            setLatest(
                data.comment,
                true,
                data.diamondCount || 1
            )

        }

    })

}

app.get('/', (req,res)=>{

    res.send("TikTok Roblox Server ON")

})

app.get('/latest', (req,res)=>{

    res.send(latestData)

})

app.get('/connect/:username', async (req,res)=>{

    const username = req.params.username
        .replace("@","")
        .trim()

    await connectTikTok(username)

    res.send(`Conectando a ${username}`)

})

app.get('/test', (req,res)=>{

    setLatest(
        "Builderman",
        false,
        0
    )

    res.send("spawned")

})

app.get('/gift', (req,res)=>{

    setLatest(
        "Roblox",
        true,
        1
    )

    res.send("gift spawned")

})

app.get('/biggift', (req,res)=>{

    setLatest(
        "Builderman",
        true,
        50
    )

    res.send("big gift spawned")

})

const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{

    console.log("Servidor iniciado")

})
