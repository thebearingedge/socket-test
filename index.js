const net = require('net')
const readline = require('readline')

let nextId = 1
const clients = new Set()
const chatLog = []
const SYSTEM = Symbol('system')
const usernamePrompt =
  '\033[2J\033[0;0fplease enter a username to join chat...\n\nusername: '

const handleClientJoined = client => name => {
  const username = name.toLowerCase().trim()
  if (username === '') {
    return client.question(usernamePrompt, handleClientJoined(client))
  }
  const tag = `${username}#${String(nextId++).padStart(4, '0')}`
  client.on('close', () => {
    clients.delete(client)
    broadcast(SYSTEM, `${tag} left`)
  })
  client.on('line', message => {
    if (!message.trim()) return
    readline.moveCursor(client.output, 0, -1)
    broadcast(tag, message)
  })
  client.output.write('\033[2J\033[0;0f' + chatLog.join('\n'))
  client.setPrompt(`\n${tag}> `)
  client.prompt()
  broadcast(SYSTEM, `${tag} joined`)
  clients.add(client)
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
  clients.forEach(client => {
    readline.clearLine(client.output, 0)
    readline.cursorTo(client.output, 0)
    client.output.write(message)
    client.prompt()
  })
  chatLog.push(message)
}

const server = net.createServer(socket => {
  const client = readline.createInterface({
    input: socket,
    output: socket
  })
  client.question(usernamePrompt, handleClientJoined(client))
})

server.listen(process.env.PORT, () => {
  console.log('\033[2J\033[0;0fnet server listening at', process.env.PORT)
})
