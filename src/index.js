// this file contains server side js

const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { createSocket } = require('dgram')
const Filter = require('bad-words')

const app = express()
// create server exlipicitly for use in socketio
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

// give access to files in the public directory
app.use(express.static(publicDirectoryPath))

let count = 0
const welcome = "Welcome to my chat app"

// runs whenever a new user connects
io.on('connection', (socket)=> {
    console.log('New socket connection')

    socket.emit('welcome', welcome)
    // use broadcast to send message to all other sockets
    socket.broadcast.emit('messageFromServer', 'A new user has joined the chat!')
    // send message from server to all clients
    socket.on('messageFromClient', (message, callback) => {
        const filter = new Filter()

        if(filter.isProfane(message)) {
            return callback('Profanity is not alowed')
        }
        io.emit('messageFromServer', message)
        callback()
    })
    // send location to all clients
    socket.on('sendLocation', (coords, callback) => {
        io.emit('messageFromServer', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback()
    })

    // runs whenever a user disconnects, 'disconnect' is built in
    socket.on('disconnect', () => {
        io.emit('messageFromServer', 'A user has left.')
    })
})

// user serve.listen instead of app.listen to use sockets
server.listen(port, () => {
    console.log("app is up and running on port " + port)
})
