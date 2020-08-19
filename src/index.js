// this file contains server side js

const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { createSocket } = require('dgram')
const Filter = require('bad-words')
const { generateMessage, generateLocation } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom, logUsers } = require('./utils/users')

const app = express()
// create server exlipicitly for use in socketio
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

// give access to files in the public directory
app.use(express.static(publicDirectoryPath))

let count = 0
const welcomeMessage = "Welcome to my chat app"

// runs whenever a new user connects
io.on('connection', (socket)=> {
    console.log('New socket connection')
    // set up chat room
    socket.on('join', (options, callback) => {
        // add user to users array
        const { error, user} = addUser({id: socket.id, ...options})

        if(error) {
            return callback(error)
        }
        // join chat room, user in room will only emit to other users in room
        socket.join(user.room)
        // io.to.emit, socket.broadcast.to.emit - to specifies the room joined
        // send welcome message
        socket.emit('messageFromServer', generateMessage(welcomeMessage))
        // use broadcast to send message to all other sockets
        socket.broadcast.to(user.room).emit('messageFromServer', generateMessage(`${user.username} has joined the chat!`))
        // update users in room
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    // send message from server to all clients
    socket.on('messageFromClient', (message, callback) => {
        const filter = new Filter()

        if(filter.isProfane(message)) {
            return callback('Profanity is not alowed')
        }
        // get user room
        const user = getUser(socket.id)

        io.to(user.room).emit('messageFromServer', generateMessage(user.username, message))
        callback()
    })
    // send location to all clients
    socket.on('sendLocation', (link, callback) => {
        // get user room
        const user = getUser(socket.id)
        io.to(user.room).emit('locationFromServer', generateLocation(user.username, link))
        callback()
    })

    // runs whenever a user disconnects, 'disconnect' is built in
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        
        if(user) {
            io.to(user.room).emit('messageFromServer', generateMessage(`${user.username} has left the chatroom.`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

// user serve.listen instead of app.listen to use sockets
server.listen(port, () => {
    console.log("app is up and running on port " + port)
})
