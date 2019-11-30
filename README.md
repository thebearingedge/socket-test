# socket-test

Playing around with Node's `net` server via UNIX domain sockets.

## Try it out

```bash
# clone this repo
git clone https://github.com/thebearingedge/socket-test && \
cd socket-test

# install nodemon
npm install

# try it out
npm run dev
```

A domain socket will be created at `/tmp/test.sock`. You can connect to it with `netcat`.

<p align="middle">
  <img src="socket-test.gif" alt="socket-test-demo">
</p>
