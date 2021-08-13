const net = require('net')

let nextId = 1
const clients = new Set()

function handleClientJoined(name) {

  const username = name.toLowerCase().trim()
  if (username === '') {
    this.write('please enter a username to join...\n\n')
    this.once('data', handleClientJoined)
    return
  }

  const userId = `${username}#${String(nextId++).padStart(4, '0')}`

  this.write(`\nyour id is ${userId}\ntype a message to chat\n`)

  clients.forEach(other => other.write(`\n${userId} has joined the chat.\n`))

  this.once('end', () => {
    clients.delete(this)
    clients.forEach(other => other.write(`\n${userId} has left the chat.\n`))
  })

  this.on('data', data => {
    const message = data.trim()
    if (message === '') return
    clients.forEach(other => {
      if (other === this) return
      other.write(`${userId}: "${data.trim()}"\n`)
    })
  })

  clients.add(this)
}

const server = net.createServer(client => {
  client.setEncoding('utf8')
  client.write('please enter a username to join...\n\n')
  client.once('data', handleClientJoined)
})

const teardown = err => {
  clients.forEach(client => client.end())
  server.listening && server.close()
  if (err) {
    console.error(err)
    process.exit(1)
  }
}

process.on('SIGINT', () => teardown(null))
process.on('uncaughtException', err => teardown(err))

server.listen(process.env.PORT, () => {
  console.log('\u001bcnet server listening at', process.env.PORT)
})
