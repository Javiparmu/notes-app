const { app } = require('../index')
const supertest = require('supertest')
const User = require('../models/User')

const api = supertest(app)

const initialNotes = [
  {
    content: 'sigue así bro'
  },
  {
    content: 'puedes con todo broski'
  }
]

const getAllContentFromNotes = async () => {
  const response = await api.get('/api/notes')
  return {
    contents: response.body.map(note => note.content),
    response
  }
}

const getUsers = async () => {
  const usersDB = await User.find({})
  return usersDB.map(user => user.toJSON())
}

module.exports = {
  initialNotes,
  api,
  getAllContentFromNotes,
  getUsers
}
