require('dotenv/config')
const net = require('net')

let nextId = 1
const clients = new Set()

const server = net.createServer(client => {
  client.id = nextId++
  clients.add(client)
  console.log(`client #${client.id} connected.`)
  client.setEncoding('utf8')
  client.on('data', data => {
    clients.forEach(other => {
      if (client === other) return
      other.write(`client #${client.id}: "${data.trim()}"\n`)
    })
  })
  client.on('end', () => {
    clients.delete(client)
    console.log(`client #${client.id} disconnected.`)
  })
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
  console.log('\u001bcsocket server listening at', process.env.PORT)
})
