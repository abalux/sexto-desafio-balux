import { hashSync, compareSync, genSaltSync } from 'bcrypt';

export function hashear(frase) {
    const salt = genSaltSync(10);
    return hashSync(frase, salt);
}

export function hasheadasSonIguales(recibida, almacenada) {
    return compareSync(recibida, almacenada);
}