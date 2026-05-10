import { injectable } from "inversify";
import "reflect-metadata";
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
 * Implementación del repositorio de autenticación usando Firebase.
 *
 * Combina Firebase Authentication (login, registro, logout, reset)
 * con Firestore (colección "usuarios") para almacenar los datos
 * extra del perfil que Firebase Auth no gestiona (nombre, foto,
 * intereses, etc.).
 *
 * El ID del documento en "usuarios" coincide con el UID de Firebase Auth,
 * por eso se usa setDoc en vez de addDoc al registrar.
 *
 * @example
 * const repo = container.get<IAuthRepository>(TYPES.IAuthRepository);
 * const usuario = await repo.login("juan@email.com", "password123");
 */
@injectable()
export class AuthRepositoryFirebase implements IAuthRepository {
  /**
   * Inicia sesión con email y contraseña.
   * Primero autentica con Firebase Auth, luego lee el documento
   * del usuario en Firestore para obtener los datos completos.
   *
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña del usuario
   * @returns Promesa que resuelve al usuario autenticado con todos sus datos
   */
  async login(email: string, password: string): Promise<Usuario> {
    const credencial = await signInWithEmailAndPassword(auth, email, password);
    const uid = credencial.user.uid;

    const docRef = doc(db, "usuarios", uid);
    const snapshot = await getDoc(docRef);
    const data = snapshot.data();

    // Si el documento no existe en Firestore, creamos uno básico
    // para no bloquear al usuario que se registró pero no tiene perfil
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
   * Registra un nuevo usuario en la aplicación.
   * Crea la cuenta en Firebase Auth y luego guarda el documento
   * del perfil en Firestore con el UID como ID del documento.
   *
   * @param email - Correo electrónico del nuevo usuario
   * @param password - Contraseña elegida
   * @param nombre - Nombre visible en la aplicación
   * @returns Promesa que resuelve al usuario recién creado
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

    // Guardar datos extra del perfil en Firestore
    // Se usa setDoc con el UID como ID del documento para que coincida con Auth
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

  /**
   * Cierra la sesión del usuario actual en Firebase Auth.
   * @returns Promesa que se resuelve al cerrar sesión
   */
  async logout(): Promise<void> {
    await signOut(auth);
  }

  /**
   * Envía un correo de restablecimiento de contraseña.
   * Firebase Auth se encarga de generar el enlace y enviarlo.
   *
   * @param email - Correo electrónico del usuario
   * @returns Promesa que se resuelve al enviar el correo
   */
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  /**
   * Obtiene el usuario actual con sesión activa.
   * Lee auth.currentUser y si existe, consulta Firestore
   * para obtener los datos completos del perfil.
   *
   * @returns Promesa que resuelve al usuario actual o null si no hay sesión
   */
  async getCurrentUser(): Promise<Usuario | null> {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      return null;
    }

    const docRef = doc(db, "usuarios", firebaseUser.uid);
    const snapshot = await getDoc(docRef);
    const data = snapshot.data();

    if (!data) {
      return new Usuario(
        firebaseUser.uid,
        firebaseUser.email || "",
        "Usuario"
      );
    }

    return new Usuario(
      firebaseUser.uid,
      data.email,
      data.nombre,
      data.fotoPerfil || null,
      data.fechaRegistro?.toDate() || new Date(),
      data.intereses || [],
      data.activo ?? true
    );
  }
}
