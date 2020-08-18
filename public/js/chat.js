// this file contains client side js

// intializze connection and create socket
const socket = io()

// welcome message
socket.on('welcome', (welcome) => {
    // welcomeP = document.getElementById('welcome')
    // welcomeP.innerHTML = welcome
    console.log(welcome)
})

// Elements-prepended with $
const $messageForm = document.querySelector('#chat-form')
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $locationButton = document.querySelector('#location-button')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML

// log message sent from server
// socket.on(<event_name>, <received data>)
socket.on("messageFromServer", (message) => {
    console.log("new message: ", message)
    messageTemplate.innerHTML = message
    const html = Mustache.render(messageTemplate, { message })
    $messages.insertAdjacentHTML('beforeend', html)
})


// add event listener to send message content to server
$messageForm.addEventListener('submit', (event)=> {
    event.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled')
    // disable form till message sent acknowledged
    const message = event.target.elements.message.value

    // socket.emit(<event name>, <data to sned>), send to all sockets
    socket.emit('messageFromClient', message, (error) => {
        // re enable message sending
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        // console.log('The message was delivered!')
        if (error) {
            return console.log(error)
        }

        console.log('message delivered')
    }) 
})

// add event listener to send users geolocation
$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your brower.')
    }
    // disable location button
    $locationButton.setAttribute('disabled', 'disabled')
    // get users location and share with other users
    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position)
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            // enable location button
            $locationButton.removeAttribute('disabled')
            console.log('Location shared.')
        })
    })
})


