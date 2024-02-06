import mongoose from "mongoose"
import { randomUUID } from "node:crypto"
import { hasheadasSonIguales, hashear } from '../utils/criptografia.js'
import { isAdmin } from '../middlewares/auth.js'

const collection = 'usuarios'

const schema = new mongoose.Schema({
    _id: { type: String, default: randomUUID },
    Email: { type: String, unique: true, required: true },
    Password: { type: String, required: true },
    Nombre: { type: String, required: true },
    Apellido: { type: String, required: true },
}, {
    strict: 'throw',
    versionKey: false,
    methods: {
    infoPublica: function () {
        return {
            Email: this.Email,
            Nombre: this.Nombre,
            Apellido: this.Apellido,
        }
    }
    },
    statics: {
        registrar: async function (reqBody) {
            console.log(reqBody)
            reqBody.Password = hashear(reqBody.Password);
            const creado = await mongoose.model(collection).create(reqBody);
    
            const datosUsuario = {
                Email: creado.Email,
                Nombre: creado.Nombre,
                Apellido: creado.Apellido,
                rol: 'usuario'
            };
    
            return datosUsuario;
    
        },
        autenticar: async function (Email , Password) {
            let datosUsuario

            if (isAdmin(Email , Password)) {
                datosUsuario = {
                    Email: 'admin',
                    Nombre: 'admin',
                    Apellido: 'admin',
                    rol: 'admin'
                }
            } else {
                const usuario = await mongoose.model(collection).findOne({ Email: Email}).lean()

                if (!usuario) {
                    throw new Error('usuario no encontrado')
                }

                if (!hasheadasSonIguales(Password, usuario['Password'])) {
                    throw new Error('las contraseñas no coinciden')
                }

                datosUsuario = {
                    Email: usuario['Email'],
                    Nombre: usuario['Nombre'],
                    Apellido: usuario['Apellido'],
                    rol: 'usuario'
                }
            }

            if (!datosUsuario) {
                throw new Error('usuario no encontrado')
            }

            return datosUsuario
        },
        resetearContrasenia: async function (Email, Password) {
                const newPassword = hashear(Password);
        
                const actualizado = await mongoose.model(collection).findOneAndUpdate(
                    { Email },
                    { $set: { Password: newPassword } },
                    { new: true }
                ).lean();
        
                if (!actualizado) {
                    throw new Error('usuario no encontrado');
                }
        
                return {
                    Email: actualizado.Email,
                    Nombre: actualizado.Nombre,
                    Apellido: actualizado.Apellido,
                    rol: 'usuario'
                };
            }
        
    }
})

export const usuariosManager = mongoose.model(collection, schema)