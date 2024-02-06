import { Router } from 'express'
import { sesionesRouter } from './sessionsRouter.js'
import { usuariosRouter } from './usersRouter.js'

export const webRouter = Router()

webRouter.use(sesionesRouter)
webRouter.use(usuariosRouter)

webRouter.get('/', (req, res) => { return res.redirect('/login') })