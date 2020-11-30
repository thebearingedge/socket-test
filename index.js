require('dotenv/config')
const net = require('net')

let nextId = 1
const clients = new Set()

const server = net.createServer(client => {
  client.id = nextId++
  clients.add(client)
  console.log(`client #${client.id} connected`)
  client.setEncoding('utf8')
  client.write('what is your name?\n')
  client.once('data', name => {
    client.name = name.trim()
    process.stdout.write(`client #${client.id} is "${client.name}"\n`)
    clients.forEach(other => {
      if (client === other) return
      other.write(`"${client.name}" joined!\n`)
    })
    client.on('data', data => {
      process.stdout.write(`${client.name}: "${data.trim()}"\n`)
      clients.forEach(other => {
        if (client === other || !client.name) return
        other.write(`${client.name}: "${data.trim()}"\n`)
      })
    })
  })
  client.on('end', () => {
    clients.delete(client)
    clients.forEach(other => other.write(`"${client.name}" left\n`))
    process.stdout.write(`"${client.name}" left\n`)
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
