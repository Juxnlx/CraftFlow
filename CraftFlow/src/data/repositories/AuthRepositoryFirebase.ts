import { injectable } from "inversify";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebaseConfig";
import { IAuthRepository } from "../../domain/interfaces/repositories/IAuthRepository";
import { Usuario } from "../../domain/entities/Usuario";

/**
 * Implementación del repositorio de autenticación con Firebase.
 *
 * Combina Firebase Authentication (sesión: login, registro, logout,
 * reset de contraseña) con Firestore (colección "usuarios") para los
 * datos de perfil que Auth no gestiona: nombre, foto, intereses…
 *
 * El ID del documento en "usuarios" coincide con el UID de Firebase
 * Auth, por eso al registrar se usa setDoc con UID en vez de addDoc.
 */
@injectable()
export class AuthRepositoryFirebase implements IAuthRepository {
  /**
   * Inicia sesión con email y contraseña.
   * Tras autenticar contra Auth, lee el documento del perfil en
   * Firestore para devolver el usuario completo.
   */
  async login(email: string, password: string): Promise<Usuario> {
    const credencial = await signInWithEmailAndPassword(auth, email, password);
    const uid = credencial.user.uid;

    const docRef = doc(db, "usuarios", uid);
    const snapshot = await getDoc(docRef);
    const data = snapshot.data();

    // Si por algún motivo no existe el documento de perfil, devolvemos
    // uno mínimo para no bloquear al usuario que sí tiene cuenta en Auth.
    if (!data) {
      return new Usuario(uid, email, "Usuario");
    }

    return new Usuario(
      uid,
      data.email,
      data.nombre,
      data.fotoPerfil || null,
      data.fechaRegistro?.toDate() || new Date(),
      data.intereses || [],
      data.activo ?? true
    );
  }

  /**
   * Registra un nuevo usuario.
   * Crea la cuenta en Firebase Auth y, a continuación, el documento
   * de perfil en Firestore usando el UID como ID del documento.
   */
  async register(
    email: string,
    password: string,
    nombre: string
  ): Promise<Usuario> {
    const credencial = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = credencial.user.uid;
    const fechaRegistro = new Date();

    await setDoc(doc(db, "usuarios", uid), {
      email,
      nombre,
      fotoPerfil: null,
      fechaRegistro,
      intereses: [],
      activo: true,
    });

    return new Usuario(uid, email, nombre, null, fechaRegistro, [], true);
  }

  /** Cierra la sesión del usuario actual en Firebase Auth. */
  async logout(): Promise<void> {
    await signOut(auth);
  }

  /** Envía un correo de restablecimiento de contraseña al email indicado. */
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }
}
