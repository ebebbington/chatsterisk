import "mocha";
// const chai = require('chai')
// const expect = chai.expect
// const sinon = require('sinon')
// chai.should()
// import SocketIO from "socket.io-client"
//
// describe('Socket Server', () => {
//
//     describe('Methods', () => {
//
//         describe('`handle`', function () {
//
//             it('Should join a room on connection', (done) => {
//                 const client1 = SocketIO('http://127.0.0.1:9009')
//                 client1.on('connect', () => {
//                     expect(client1.connected).to.equal(true)
//                     client1.disconnect();
//                     done();
//                 })
//             })
//
//             it('Should emit the room when requested', (done) => {
//                 const client1 = SocketIO('http://127.0.0.1:9009')
//                 client1.on('room', (data: { myId: string, users: string[], name: string }) => {
//                     //console.log(client)
//                     expect(data.myId).to.exist
//                     expect(data.users).to.exist
//                     expect(data.users.length).to.equal(0)
//                     expect(data.name).to.exist
//                     client1.disconnect()
//                     done()
//                 })
//                 client1.emit('room')
//             })
//
//             it('Should emit the room when disconnected', async function () {
//                 this.timeout(10000)
//                 const client1 = SocketIO('http://127.0.0.1:9009', {multiplex: false})
//                 const client2 = SocketIO('http://127.0.0.1:9009', {multiplex: false})
//                 setTimeout(() => {
//                     client2.disconnect()
//                 }, 1000)
//                 await client1.on('room', (data: any) => {
//                     expect(data).to.exist
//                     client1.disconnect()
//                 })
//             })
//
//             it('Should send an offer to the other user on `call-user`', async () => {
//                 const client1 = SocketIO('http://127.0.0.1:9009', {multiplex: false})
//                 const client2 = SocketIO('http://127.0.0.1:9009', {multiplex: false})
//                 const client1Id = client1.id
//                 const offer = { test: 'test' }
//                 setTimeout(() => {
//                     client1.emit('call-user', { to: client2.id, offer: offer })
//                 }, 1000)
//                 await client2.on('call-made', (data: any) => {
//                     expect(data.id).to.equal(client1Id)
//                     expect(data.offer.test).to.equal(offer.test)
//                     client1.disconnect()
//                     client2.disconnect()
//                 })
//             })
//
//             it('Should send an answer and a `make-answer` was made', async () => {
//                 const client1 = SocketIO('http://127.0.0.1:9009', {multiplex: false})
//                 const client2 = SocketIO('http://127.0.0.1:9009', {multiplex: false})
//                 const client2Id = client2.id
//                 const answer = { test: 'test' }
//                 setTimeout(() => {
//                     client2.emit('make-answer', { to: client1.id, answer: answer })
//                 }, 1000)
//                 await client1.on('answer-made', (data: any) => {
//                     expect(data.id).to.equal(client2Id)
//                     expect(data.answer.test).to.equal(answer.test)
//                     client1.disconnect()
//                     client2.disconnect()
//                 })
//             })
//
//         })
//
//     })
//
// })
