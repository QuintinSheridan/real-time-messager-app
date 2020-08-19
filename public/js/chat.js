// this file contains client side js

// intializze connection and create socket
const socket = io()

// welcome message
socket.on('welcome', (welcome) => {
    // welcomeP = document.getElementById('welcome')
    // welcomeP.innerHTML = welcome
    console.log(welcome.message)
})

// Elements-prepended with $
const $messageForm = document.querySelector('#chat-form')
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $locationButton = document.querySelector('#location-button')
const $messages = document.querySelector('#messages')
// const $locations = documnet.querySelector('')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
const autoScroll = () => {
    // get new message element
    const $newMessage = $messages.lastElementChild

    // get the height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin*2

    // get visible height
    const visibleHeight = $messages.offsetHeight

    // height of messages container
    const containerHeight = $messages.scrollHeight

    // how far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

// log message sent from server
// socket.on(<event_name>, <received data>)
socket.on("messageFromServer", (message) => {
    console.log("new message: ", message.message)
    messageTemplate.innerHTML = message.message
    const html = Mustache.render(messageTemplate, { 
        username: message.username,
        createdAt: moment(message.createdAt).format('h:mm:A'), 
        message: message.message 
    })
    $messages.insertAdjacentHTML('beforeend', html)

    autoScroll()
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
        const link = `http://google.com/maps/?q=${position.coords.latitude},${position.coords.longitude}`
        socket.emit('sendLocation', link, () => {
            // enable location button
            $locationButton.removeAttribute('disabled')
            console.log('Location shared.')
        })
    })
})

// Add a link with location to the chat
socket.on('locationFromServer', (location) => {
    console.log('new location ' + location.link)
    locationTemplate.href = location.link
    const html = Mustache.render(locationTemplate, {
        username: location.username, 
        createdAt: moment(location.createdAt).format('h:mm:A'),
        link: location.link })
    $messages.insertAdjacentHTML('beforeend', html)

    autoScroll()
})

// Update side bar with room users
socket.on('roomData', ({room, users}) => {
    // console.log('room: ', room)
    // console.log('users: ', users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})



// emit qeury parameters
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        //  redirect to homepage
        location.href = '/'
    }
})
