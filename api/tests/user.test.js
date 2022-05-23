const bcrypt = require('bcrypt')
const User = require('../models/User')
const { api, getUsers } = require('./helpers')
const { server } = require('../index')
const mongoose = require('mongoose')

describe('creating a new user', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('pswd', 10)
    const user = new User({ username: 'miduroot', name: 'LocoBro', passwordHash })

    await user.save()
  })

  test('works as expected creating a new username', async () => {
    const usersAtStart = await getUsers()

    const newUser = {
      username: 'BroBro',
      name: 'Amigo',
      password: 'Kebab'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await getUsers()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username is already taken', async () => {
    const usersAtStart = await getUsers()

    const newUser = {
      username: 'miduroot',
      name: 'perro',
      password: 'Kegehhweab'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error.errors.username.message).toContain('`username` to be unique')
    const usersAtEnd = await getUsers()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
