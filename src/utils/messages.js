// function to attach a createddAt tmestamp to a message
const generateMessage = (username, message) => {
    return {
        username,
        message,
        createdAt: new Date().getTime()
    }
}

const generateLocation = (username, link) => {
    return {
        username,
        link,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocation
}