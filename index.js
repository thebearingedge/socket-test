const net = require('net')
const readline = require('readline')

let nextId = 1
const clients = new Set()
const SYSTEM = Symbol('system')

const handleClientJoined = client => name => {
  const username = name.toLowerCase().trim()
  if (username === '') {
    return client.question(
      'please enter a username to join chat...\n\nusername: ',
      handleClientJoined(client)
    )
  }
  const tag = `${username}#${String(nextId++).padStart(4, '0')}`
  clients.add(client)
  client.on('close', () => {
    broadcast(SYSTEM, `${tag} left`)
    clients.delete(client)
  })
  client.on('line', message => {
    readline.moveCursor(client.socket, 0, -1)
    broadcast(tag, message.trim() || '...')
  })
  broadcast(SYSTEM, `${tag} joined`)
}

function broadcast(tag, message) {
  if (tag === SYSTEM) {
    message = [
      '-'.repeat(message.length),
      message,
      '-'.repeat(message.length),
    ].join('\n')
  } else {
    message = `${new Date().toLocaleTimeString()} - ${tag}: ${message}`
  }
  clients.forEach(other => {
    readline.clearLine(other.socket, 0)
    readline.cursorTo(other.socket, 0)
    other.socket.write(`${message}`)
    other.prompt(true)
  })
}

const server = net.createServer(socket => {
  const client = readline.createInterface({
    input: socket,
    output: socket
  })
  client.socket = socket
  client.setPrompt('\n> ')
  client.question(
    'please enter a username to join chat...\n\nusername: ',
    handleClientJoined(client)
  )
})

server.listen(process.env.PORT, () => {
  console.log('\u001bcnet server listening at', process.env.PORT)
})
