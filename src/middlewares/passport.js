import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GithubStrategy } from 'passport-github2'

import { usuariosManager } from '../models/users.mongoose.js'
import { githubCallbackUrl, githubClientSecret, githubClienteId } from '../config.js'


passport.use('github', new GithubStrategy({
    clientID: githubClienteId,
    clientSecret: githubClientSecret,
    callbackURL: githubCallbackUrl
}, async function verify(accessToken, refreshToken, profile, done) {
    console.log(profile)

    const usuario = await usuariosManager.findOne({ Email: profile.username })
    if (usuario) {
        return done(null, {
            ...usuario.infoPublica(),
            rol: 'usuario'
        })
    }

    try {
        const registrado = await usuariosManager.create({
            Email: profile.username,
            Password: '(sin especificar)',
            Nombre: profile.displayName,
            Apellido: '(sin especificar)',
        })
        done(null, {
            ...registrado.infoPublica(),
            rol: 'usuario'
        })
    } catch (error) {
    done(error)
    }

}))

passport.use('register', new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'Email', 
    passwordField: 'Password'
    },
    async (req, _u, _p, done) => {
        console.log('Register strategy called');
        try {
            const datosUsuario = await usuariosManager.registrar(req.body)
            console.log('User registered:', datosUsuario)
            done(null, datosUsuario)
        } catch (error) {
            console.error('Registration error:', error);
            done(null, false, error.message)
        }
}))

passport.use('login', new LocalStrategy({
    usernameField: 'Email',
    passwordField: 'Password'
}, async (username, password, done) => {
    console.log('Email recibido:', username);
    console.log('Password recibido:', password);
    try {
        const datosUsuario = await usuariosManager.autenticar(username, password);
        done(null, datosUsuario);
    } catch (error) {
        return done(null, false, error.message);
    }
}));



passport.serializeUser((user, next) => { next(null, user) })
passport.deserializeUser((user, next) => { next(null, user) })

const passportInitialize = passport.initialize()
const passportSession = passport.session()

export function autenticacion(req, res, next) {
    passportInitialize(req, res, () => {
        passportSession(req, res, next)
    })
}