require('dotenv').config()
require('./mongo')
const notFound = require('./middleware/notFound.js')
const handleErrors = require('./middleware/handleErrors.js')
const express = require('express')
const cors = require('cors')
const app = express()
const Note = require('./models/Note')

const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const testingRouter = require('./controllers/testing')

const User = require('./models/User')
const userExtractor = require('./middleware/userExtractor')

app.use(cors())
app.use(express.json())
app.use(express.static('../app/build'))

app.get('/api/notes', async (request, response) => {
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1
  })
  response.json(notes)
})

app.get('/api/notes/:id', (request, response, next) => {
  const id = request.params.id
  Note.findById(id).then(note => {
    response.json(note)
  }).catch(err => {
    next(err)
    console.error(err)
    response.status(400).end()
  })
})

app.delete('/api/notes/:id', userExtractor, async (request, response, next) => {
  const id = request.params.id
  try {
    await Note.findByIdAndDelete(id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.post('/api/notes', userExtractor, async (request, response, next) => {
  const { content } = request.body

  // sacar userId de request
  const { userId } = request
  const user = await User.findById(userId)

  if (!content) {
    return response.status(400).json({
      error: 'required "content" field is missing'
    })
  }

  const newNote = new Note({
    content,
    user: user._id
  })

  // newNote.save().then(savedNote => {
  //   response.json(savedNote)
  // })
  // Otra posibilidad con async await
  try {
    const savedNote = await newNote.save()

    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    response.json(savedNote)
  } catch (error) {
    next(error)
  }
})

app.put('/api/notes/:id', userExtractor, (request, response, next) => {
  const { id } = request.params
  const note = request.body

  const newNoteInfo = {
    content: note.content
  }

  Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
    .then(result => {
      response.json(result)
    }
    )
})

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') {
  app.use('/api/testing', testingRouter)
}

app.use(notFound)

app.use(handleErrors)

const PORT = process.env.PORT

const server = app.listen(PORT, () => {
  console.log('Server running')
})

module.exports = { app, server }
