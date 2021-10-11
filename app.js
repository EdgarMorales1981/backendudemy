const express =  require('express')

const app = express();

const cookieParser = require('cookie-parser')

const errorMiddlewares = require('./middlewares/errors')

app.use(express.json())

app.use(cookieParser())
//las router

const products = require('./routes/product')
const auth = require('./routes/auth')
const order =  require('./routes/order')

app.use('/api/v1', products)
app.use('/api/v1', auth)
app.use('/api/v1', order)

//para menejar errores
app.use(errorMiddlewares)

module.exports = app