import express from 'express'
import mongoose from 'mongoose'
import { engine } from 'express-handlebars'

import { __dirname } from './utils.js'

import { MONGODB_CNX_STR, PORT } from './config.js'

import { webRouter } from './routers/webRouter.js'
import { sesiones } from './middlewares/sesiones.js'
import { autenticacion } from './middlewares/passport.js'

await mongoose.connect(MONGODB_CNX_STR)
console.log(`conectado a base de datos en: "${MONGODB_CNX_STR}"`)

export const app = express()

app.engine('handlebars', engine())
app.set("view engine", "handlebars");
app.set("views", `${__dirname}/views`);

app.listen(PORT, () => {
    console.log(`servidor escuchando peticiones en puerto: ${PORT}`)
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(sesiones)
app.use(autenticacion)

app.use('/static', express.static('./static'))

app.use('/', webRouter)
