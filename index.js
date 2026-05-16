const { WebcastPushConnection } = require('tiktok-live-connector')
const express = require('express')

const app = express()

const tiktokUsername = 'pochi_i.l0ve'

const tiktokLiveConnection = new WebcastPushConnection(tiktokUsername)

let latestData = ""

app.get('/latest', (req,res)=>{
    res.send(latestData)
})

app.get('/test', (req,res)=>{
    latestData = JSON.stringify({
        username: "Builderman",
        gift: false,
        coins: 0,
        id: Date.now()
    })
    res.send("spawned")
})

app.get('/gift', (req,res)=>{
    latestData = JSON.stringify({
        username: "Roblox",
        gift: true,
        coins: 1,
        id: Date.now()
    })
    res.send("gift spawned")
})

app.get('/biggift', (req,res)=>{
    latestData = JSON.stringify({
        username: "Builderman",
        gift: true,
        coins: 50,
        id: Date.now()
    })
    res.send("big gift spawned")
})

app.get('/test2', (req,res)=>{
    latestData = JSON.stringify({
        username: "Roblox",
        gift: false,
        coins: 0,
        id: Date.now()
    })
    res.send("spawned 2")
})

app.get('/test3', (req,res)=>{
    latestData = JSON.stringify({
        username: "Shedletsky",
        gift: false,
        coins: 0,
        id: Date.now()
    })
    res.send("spawned 3")
})

app.get('/test4', (req,res)=>{
    latestData = JSON.stringify({
        username: "Telamon",
        gift: false,
        coins: 0,
        id: Date.now()
    })
    res.send("spawned 4")
})

app.get('/test5', (req,res)=>{
    latestData = JSON.stringify({
        username: "Clockwork",
        gift: false,
        coins: 0,
        id: Date.now()
    })
    res.send("spawned 5")
})

app.get('/test6', (req,res)=>{
    latestData = JSON.stringify({
        username: "Stickmasterluke",
        gift: false,
        coins: 0,
        id: Date.now()
    })
    res.send("spawned 6")
})

app.listen(3000, ()=>{
    console.log("Servidor iniciado")
})

tiktokLiveConnection.connect()
.then(state => {
    console.log(`Conectado al live de ${state.uniqueId}`)
})
.catch(err => {
    console.log(err)
})

tiktokLiveConnection.on('chat', data => {
    latestData = JSON.stringify({
        username: data.comment,
        gift: false,
        coins: 0,
        id: Date.now()
    })
})

tiktokLiveConnection.on('gift', data => {
    if(data.comment){
        latestData = JSON.stringify({
            username: data.comment,
            gift: true,
            coins: data.diamondCount || 1,
            id: Date.now()
        })
    }
})