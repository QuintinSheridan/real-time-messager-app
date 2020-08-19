// File with functions to keep track of chat room users
const users = []

// add user
const addUser = ({ id, username, room }) => {
    // clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate data
    if(!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if(existingUser) {
        return {
            error: "Username already exists in this chatroom."
        }
    }

    // Store user
    const user = { id, username, room}
    users.push(user)
    return { user }
}


// get user
const getUser = (id) => users.find((user) => user.id === id)


// get users in room
const getUsersInRoom = (room) => users.filter((user) => user.room === room.toLowerCase())


// remove user
const removeUser = (id) => {
    // console.log('remove users: ', users)
    const userIndex = users.findIndex((user)=> user.id === id)
    
    if(userIndex !== -1) {
        return users.splice(userIndex, 1)[0]
    }
}

// log function for debugging
const logUsers = () => {
    console.log(users)
}

module.exports = {
    addUser,
    getUser,
    getUsersInRoom,
    removeUser,
    logUsers
}