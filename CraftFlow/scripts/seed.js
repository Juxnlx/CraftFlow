// Script de seed para poblar Firestore con datos de prueba.
// Ejecutar desde la raiz del proyecto: node scripts/seed.js

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  deleteDoc,
} = require("firebase/firestore");
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require("firebase/auth");

const firebaseConfig = {
  apiKey: "AIzaSyBe5Ix498c2ik5Lkee6oTdOF6bjL1u_HH0",
  authDomain: "craftflow-tfg.firebaseapp.com",
  projectId: "craftflow-tfg",
  storageBucket: "craftflow-tfg.firebasestorage.app",
  messagingSenderId: "70016987112",
  appId: "1:70016987112:web:a548b3cfe0eaf846217e5d",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Cuentas de prueba que se demuestran a los profesores.
const CUENTAS_PRUEBA = [
  {
    email: "craftflow.test@gmail.com",
    password: "Test1234",
    nombre: "Cuenta Demo Crochet",
    intereses: ["crochet"],
  },
  {
    email: "craftflow.test2@gmail.com",
    password: "Test1234",
    nombre: "Cuenta Demo Ceramica",
    intereses: ["ceramica"],
  },
];

// Crea la cuenta en Firebase Auth si no existe; si existe, hace login.
// En ambos casos devuelve el UID para usarlo como ID de documento en Firestore.
async function obtenerOCrearUsuarioAuth(email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    console.log(`  ✓ Cuenta creada en Auth: ${email}`);
    return cred.user.uid;
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log(`  ✓ Cuenta ya existia, reutilizando: ${email}`);
      return cred.user.uid;
    }
    throw err;
  }
}

async function limpiarColeccion(nombreColeccion) {
  const snapshot = await getDocs(collection(db, nombreColeccion));
  for (const d of snapshot.docs) {
    await deleteDoc(d.ref);
  }
  console.log(`  ✓ Coleccion "${nombreColeccion}" limpiada`);
}

const USUARIOS_FICTICIOS = [
  {
    id: "user_maria",
    email: "maria.lopez@craftflow.com",
    nombre: "Maria Lopez",
    fotoPerfil: null,
    fechaRegistro: new Date("2025-09-15"),
    intereses: ["crochet"],
    activo: true,
  },
  {
    id: "user_ana",
    email: "ana.garcia@craftflow.com",
    nombre: "Ana Garcia",
    fotoPerfil: null,
    fechaRegistro: new Date("2025-10-01"),
    intereses: ["crochet", "ceramica"],
    activo: true,
  },
  {
    id: "user_pedro",
    email: "pedro.ruiz@craftflow.com",
    nombre: "Pedro Ruiz",
    fotoPerfil: null,
    fechaRegistro: new Date("2025-08-20"),
    intereses: ["ceramica"],
    activo: true,
  },
  {
    id: "user_lucia",
    email: "lucia.martin@craftflow.com",
    nombre: "Lucia Martin",
    fotoPerfil: null,
    fechaRegistro: new Date("2025-11-05"),
    intereses: ["crochet"],
    activo: true,
  },
  {
    id: "user_carlos",
    email: "carlos.vega@craftflow.com",
    nombre: "Carlos Vega",
    fotoPerfil: null,
    fechaRegistro: new Date("2025-07-10"),
    intereses: ["ceramica"],
    activo: true,
  },
  {
    id: "user_elena",
    email: "elena.torres@craftflow.com",
    nombre: "Elena Torres",
    fotoPerfil: null,
    fechaRegistro: new Date("2025-12-01"),
    intereses: ["crochet", "ceramica"],
    activo: true,
  },
];

const PROYECTOS = [
  // Crochet
  {
    idUsuario: "user_maria",
    nombre: "Amigurumi Rana",
    descripcion:
      "Adorable rana tejida a crochet de 15cm de altura. Perfecta para regalar o decorar. Se trabaja en espiral con punto bajo y aumentos simples. Ideal para practicar amigurumis si ya dominas los puntos basicos.",
    imagen: "https://loremflickr.com/600/400/crochet,amigurumi,frog?lock=1",
    visibilidad: "publico",
    dificultad: "intermedio",
    etiquetas: ["Crochet"],
    materiales: [
      { nombre: "Hilo algodon verde", categoria: "lana", cantidad: "80 metros" },
      { nombre: "Hilo algodon blanco", categoria: "lana", cantidad: "20 metros" },
      { nombre: "Hilo algodon negro", categoria: "lana", cantidad: "5 metros" },
      { nombre: "Relleno de fibra", categoria: "tela", cantidad: "1" },
    ],
    herramientas: [
      { nombre: "Aguja de crochet 3.5mm", tipo: "Agujas de crochet" },
      { nombre: "Aguja lanera", tipo: "Agujas" },
      { nombre: "Tijeras", tipo: "Tijeras" },
    ],
    pasos: [
      { numeroOrden: 1, descripcion: "Anillo magico con 6 puntos bajos. Cerrar con punto deslizado.", imagen: null },
      { numeroOrden: 2, descripcion: "Aumentos: 2pb en cada punto (12pb total).", imagen: null },
      { numeroOrden: 3, descripcion: "Aumentos alternados: *1pb, aum* repetir (18pb).", imagen: null },
      { numeroOrden: 4, descripcion: "Continuar aumentando hasta tener 36pb.", imagen: null },
      { numeroOrden: 5, descripcion: "Tejer 10 vueltas sin aumentos ni disminuciones para el cuerpo.", imagen: null },
      { numeroOrden: 6, descripcion: "Disminuciones para cerrar. Rellenar antes de cerrar del todo.", imagen: null },
      { numeroOrden: 7, descripcion: "Tejer las patas (4 piezas iguales): anillo magico 6pb, 3 vueltas.", imagen: null },
      { numeroOrden: 8, descripcion: "Tejer los ojos con hilo blanco y bordar pupilas con negro.", imagen: null },
      { numeroOrden: 9, descripcion: "Coser todas las piezas al cuerpo con aguja lanera.", imagen: null },
    ],
    fechaCreacion: new Date("2026-01-15"),
    activo: true,
  },
  {
    idUsuario: "user_maria",
    nombre: "Granny Square Manta",
    descripcion:
      "Manta colorida compuesta por 20 granny squares clasicos unidos entre si. Perfecta para tardes de sofa. Cada cuadrado mide 15x15cm y se trabaja con colores variados.",
    imagen: "https://loremflickr.com/600/400/crochet,granny,square,blanket?lock=2",
    visibilidad: "publico",
    dificultad: "facil",
    etiquetas: ["Crochet"],
    materiales: [
      { nombre: "Lana acrilica colores variados", categoria: "lana", cantidad: "500 metros" },
      { nombre: "Lana acrilica beige para union", categoria: "lana", cantidad: "100 metros" },
    ],
    herramientas: [
      { nombre: "Aguja de crochet 5mm", tipo: "Agujas de crochet" },
      { nombre: "Tijeras", tipo: "Tijeras" },
      { nombre: "Aguja lanera", tipo: "Agujas" },
    ],
    pasos: [
      { numeroOrden: 1, descripcion: "Anillo magico, 3 cadenas + 2 puntos altos. Repetir 4 veces para las esquinas.", imagen: null },
      { numeroOrden: 2, descripcion: "Segunda vuelta: 3pa en cada esquina, 2pa entre grupos.", imagen: null },
      { numeroOrden: 3, descripcion: "Tercera vuelta: cambiar color y repetir el patron de esquinas.", imagen: null },
      { numeroOrden: 4, descripcion: "Hacer 20 cuadrados iguales cambiando combinaciones de colores.", imagen: null },
      { numeroOrden: 5, descripcion: "Unir los cuadrados con punto raso en filas de 4x5.", imagen: null },
      { numeroOrden: 6, descripcion: "Borde final: 2 vueltas de punto bajo alrededor de toda la manta.", imagen: null },
    ],
    fechaCreacion: new Date("2026-02-01"),
    activo: true,
  },
  {
    idUsuario: "user_lucia",
    nombre: "Bolso de Red Crochet",
    descripcion:
      "Bolso de red estilo market bag tejido a crochet. Muy resistente y practico para la compra. Se estira bastante al llenarlo. Patron basado en cadenas y puntos bajos.",
    imagen: "https://loremflickr.com/600/400/crochet,market,bag,net?lock=3",
    visibilidad: "publico",
    dificultad: "facil",
    etiquetas: ["Crochet"],
    materiales: [
      { nombre: "Hilo de algodon grueso natural", categoria: "lana", cantidad: "150 metros" },
    ],
    herramientas: [
      { nombre: "Aguja de crochet 4mm", tipo: "Agujas de crochet" },
      { nombre: "Tijeras", tipo: "Tijeras" },
    ],
    pasos: [
      { numeroOrden: 1, descripcion: "Cadena de 40 puntos. Unir en redondo.", imagen: null },
      { numeroOrden: 2, descripcion: "Vuelta 1: *1pb, 3 cadenas, saltar 2* repetir.", imagen: null },
      { numeroOrden: 3, descripcion: "Repetir el patron de red durante 30 vueltas.", imagen: null },
      { numeroOrden: 4, descripcion: "Para las asas: cadena de 50 puntos, unir al otro lado.", imagen: null },
      { numeroOrden: 5, descripcion: "Reforzar las asas con una vuelta de punto bajo encima.", imagen: null },
    ],
    fechaCreacion: new Date("2026-01-20"),
    activo: true,
  },
  {
    idUsuario: "user_ana",
    nombre: "Amigurumi Pulpo",
    descripcion:
      "Pulpo de crochet con tentaculos rizados. Muy popular como regalo para bebes. Mide unos 12cm de alto. Los tentaculos se rizan solos gracias a los aumentos consecutivos.",
    imagen: "https://loremflickr.com/600/400/crochet,octopus,amigurumi?lock=4",
    visibilidad: "publico",
    dificultad: "intermedio",
    etiquetas: ["Crochet"],
    materiales: [
      { nombre: "Hilo algodon lila", categoria: "lana", cantidad: "60 metros" },
      { nombre: "Hilo algodon blanco", categoria: "lana", cantidad: "10 metros" },
      { nombre: "Relleno de fibra", categoria: "tela", cantidad: "1" },
    ],
    herramientas: [
      { nombre: "Aguja de crochet 3mm", tipo: "Agujas de crochet" },
      { nombre: "Aguja lanera", tipo: "Agujas" },
      { nombre: "Tijeras", tipo: "Tijeras" },
    ],
    pasos: [
      { numeroOrden: 1, descripcion: "Cabeza: anillo magico 6pb, aumentar hasta 36pb.", imagen: null },
      { numeroOrden: 2, descripcion: "Tejer 8 vueltas rectas para la cabeza.", imagen: null },
      { numeroOrden: 3, descripcion: "Disminuir hasta 18pb. Rellenar la cabeza.", imagen: null },
      { numeroOrden: 4, descripcion: "Tentaculos (8 iguales): cadena de 30, 2pb en cada punto para rizar.", imagen: null },
      { numeroOrden: 5, descripcion: "Coser tentaculos a la base de la cabeza.", imagen: null },
      { numeroOrden: 6, descripcion: "Bordar ojos y boca con hilo blanco y negro.", imagen: null },
    ],
    fechaCreacion: new Date("2026-02-10"),
    activo: true,
  },
  {
    idUsuario: "user_elena",
    nombre: "Posavasos Mandala",
    descripcion:
      "Set de 4 posavasos con diseno mandala en crochet. Cada uno tiene un patron de colores diferente. Miden 10cm de diametro. Se trabajan en redondo.",
    imagen: "https://loremflickr.com/600/400/crochet,mandala,coaster?lock=5",
    visibilidad: "publico",
    dificultad: "facil",
    etiquetas: ["Crochet"],
    materiales: [
      { nombre: "Hilo algodon colores variados", categoria: "lana", cantidad: "40 metros" },
    ],
    herramientas: [
      { nombre: "Aguja de crochet 3mm", tipo: "Agujas de crochet" },
      { nombre: "Tijeras", tipo: "Tijeras" },
    ],
    pasos: [
      { numeroOrden: 1, descripcion: "Anillo magico con 8 puntos bajos.", imagen: null },
      { numeroOrden: 2, descripcion: "Vuelta 2: 2pb en cada punto (16pb). Cambiar color.", imagen: null },
      { numeroOrden: 3, descripcion: "Vuelta 3: *1pb, aum* repetir (24pb).", imagen: null },
      { numeroOrden: 4, descripcion: "Vuelta 4: puntos altos con cambios de color para el mandala.", imagen: null },
      { numeroOrden: 5, descripcion: "Vuelta 5: borde con punto cangrejo. Rematar y cortar.", imagen: null },
    ],
    fechaCreacion: new Date("2026-01-25"),
    activo: true,
  },
  {
    idUsuario: "user_lucia",
    nombre: "Cactus Amigurumi Decorativo",
    descripcion:
      "Cactus tejido a crochet en su macetita. No necesita riego. Perfecto para decorar el escritorio o la estanteria. Incluye flor decorativa en la parte superior.",
    imagen: "https://loremflickr.com/600/400/crochet,cactus,amigurumi?lock=6",
    visibilidad: "publico",
    dificultad: "intermedio",
    etiquetas: ["Crochet"],
    materiales: [
      { nombre: "Hilo algodon verde oscuro", categoria: "lana", cantidad: "40 metros" },
      { nombre: "Hilo algodon marron", categoria: "lana", cantidad: "20 metros" },
      { nombre: "Hilo algodon rosa", categoria: "lana", cantidad: "5 metros" },
      { nombre: "Relleno de fibra", categoria: "tela", cantidad: "1" },
    ],
    herramientas: [
      { nombre: "Aguja de crochet 3.5mm", tipo: "Agujas de crochet" },
      { nombre: "Aguja lanera", tipo: "Agujas" },
      { nombre: "Tijeras", tipo: "Tijeras" },
    ],
    pasos: [
      { numeroOrden: 1, descripcion: "Maceta (marron): anillo magico 6pb, aumentar hasta 30pb. Tejer 5 vueltas rectas.", imagen: null },
      { numeroOrden: 2, descripcion: "Cactus (verde): anillo magico 6pb, aumentar hasta 24pb. Tejer 15 vueltas.", imagen: null },
      { numeroOrden: 3, descripcion: "Cerrar el cactus con disminuciones. Rellenar.", imagen: null },
      { numeroOrden: 4, descripcion: "Brazos del cactus (2): cadena 8, pb de vuelta. Coser al cuerpo.", imagen: null },
      { numeroOrden: 5, descripcion: "Flor (rosa): anillo magico, 5 petalos con puntos altos.", imagen: null },
      { numeroOrden: 6, descripcion: "Coser la flor arriba del cactus. Insertar cactus en la maceta.", imagen: null },
    ],
    fechaCreacion: new Date("2026-02-05"),
    activo: true,
  },
  {
    idUsuario: "user_maria",
    nombre: "Diadema Trenzada Crochet",
    descripcion:
      "Diadema elegante con patron de trenza celta en crochet. Se ajusta a cualquier tamano gracias al elastico. Queda genial con pelo recogido o suelto.",
    imagen: "https://loremflickr.com/600/400/crochet,headband,braid?lock=7",
    visibilidad: "publico",
    dificultad: "avanzado",
    etiquetas: ["Crochet"],
    materiales: [
      { nombre: "Hilo algodon beige", categoria: "lana", cantidad: "30 metros" },
      { nombre: "Goma elastica fina", categoria: "tela", cantidad: "1" },
    ],
    herramientas: [
      { nombre: "Aguja de crochet 3mm", tipo: "Agujas de crochet" },
      { nombre: "Tijeras", tipo: "Tijeras" },
      { nombre: "Aguja lanera", tipo: "Agujas" },
    ],
    pasos: [
      { numeroOrden: 1, descripcion: "Tejer 3 tiras de cadenas + pb de 40cm cada una.", imagen: null },
      { numeroOrden: 2, descripcion: "Trenzar las 3 tiras en patron celta.", imagen: null },
      { numeroOrden: 3, descripcion: "Coser los extremos juntos.", imagen: null },
      { numeroOrden: 4, descripcion: "Insertar la goma elastica en la union.", imagen: null },
      { numeroOrden: 5, descripcion: "Cerrar y rematar con aguja lanera.", imagen: null },
    ],
    fechaCreacion: new Date("2026-02-15"),
    activo: true,
  },
  {
    idUsuario: "user_ana",
    nombre: "Monedero Crochet con Boquilla",
    descripcion:
      "Pequeno monedero semicircular tejido a crochet con boquilla metalica de clip. Ideal para llevar monedas o auriculares. Se trabaja en semicirculos.",
    imagen: "https://loremflickr.com/600/400/crochet,coin,purse,pouch?lock=8",
    visibilidad: "publico",
    dificultad: "intermedio",
    etiquetas: ["Crochet"],
    materiales: [
      { nombre: "Hilo algodon rosa", categoria: "lana", cantidad: "25 metros" },
      { nombre: "Hilo algodon crema", categoria: "lana", cantidad: "10 metros" },
    ],
    herramientas: [
      { nombre: "Aguja de crochet 2.5mm", tipo: "Agujas de crochet" },
      { nombre: "Tijeras", tipo: "Tijeras" },
    ],
    pasos: [
      { numeroOrden: 1, descripcion: "Cadena de 20 puntos. Trabajar en filas de ida y vuelta.", imagen: null },
      { numeroOrden: 2, descripcion: "Tejer semicirculo con aumentos en los extremos (10 filas).", imagen: null },
      { numeroOrden: 3, descripcion: "Hacer 2 piezas iguales (delantera y trasera).", imagen: null },
      { numeroOrden: 4, descripcion: "Unir ambas piezas con punto bajo por el borde curvo.", imagen: null },
      { numeroOrden: 5, descripcion: "Coser la boquilla metalica en la parte recta.", imagen: null },
    ],
    fechaCreacion: new Date("2026-01-28"),
    activo: true,
  },
  {
    idUsuario: "user_elena",
    nombre: "Scrunchie / Coletero Crochet",
    descripcion:
      "Coletero esponjoso tejido a crochet sobre una goma elastica. Se hace en 20 minutos. Perfecto para principiantes y para usar restos de hilo.",
    imagen: "https://loremflickr.com/600/400/crochet,scrunchie,hair?lock=9",
    visibilidad: "publico",
    dificultad: "facil",
    etiquetas: ["Crochet"],
    materiales: [
      { nombre: "Hilo algodon cualquier color", categoria: "lana", cantidad: "15 metros" },
      { nombre: "Goma elastica para pelo", categoria: "tela", cantidad: "1" },
    ],
    herramientas: [
      { nombre: "Aguja de crochet 4mm", tipo: "Agujas de crochet" },
      { nombre: "Tijeras", tipo: "Tijeras" },
    ],
    pasos: [
      { numeroOrden: 1, descripcion: "Hacer punto bajo alrededor de la goma elastica (40-50 puntos).", imagen: null },
      { numeroOrden: 2, descripcion: "Vuelta 2: 3 puntos altos en cada punto bajo para crear volumen.", imagen: null },
      { numeroOrden: 3, descripcion: "Cerrar con punto deslizado. Cortar y esconder el hilo.", imagen: null },
    ],
    fechaCreacion: new Date("2026-02-20"),
    activo: true,
  },
  {
    idUsuario: "user_lucia",
    nombre: "Alfiletero Seta Amigurumi",
    descripcion:
      "Pequena seta amigurumi que funciona como alfiletero. El sombrero es rojo con puntos blancos y la base esta rellena con guata firme para clavar los alfileres.",
    imagen: "https://loremflickr.com/600/400/crochet,mushroom,pincushion?lock=10",
    visibilidad: "publico",
    dificultad: "facil",
    etiquetas: ["Crochet"],
    materiales: [
      { nombre: "Hilo algodon rojo", categoria: "lana", cantidad: "20 metros" },
      { nombre: "Hilo algodon blanco", categoria: "lana", cantidad: "15 metros" },
      { nombre: "Relleno de fibra", categoria: "tela", cantidad: "1" },
    ],
    herramientas: [
      { nombre: "Aguja de crochet 3mm", tipo: "Agujas de crochet" },
      { nombre: "Aguja lanera", tipo: "Agujas" },
      { nombre: "Tijeras", tipo: "Tijeras" },
    ],
    pasos: [
      { numeroOrden: 1, descripcion: "Sombrero (rojo): anillo magico 6pb, aumentar hasta 30pb. Tejer 3 vueltas rectas.", imagen: null },
      { numeroOrden: 2, descripcion: "Bordar puntos blancos en el sombrero con aguja lanera.", imagen: null },
      { numeroOrden: 3, descripcion: "Tallo (blanco): anillo magico 6pb, aumentar a 18pb. Tejer 6 vueltas.", imagen: null },
      { numeroOrden: 4, descripcion: "Rellenar bien firme el tallo y el sombrero.", imagen: null },
      { numeroOrden: 5, descripcion: "Coser sombrero al tallo. Listo para usar como alfiletero.", imagen: null },
    ],
    fechaCreacion: new Date("2026-02-08"),
    activo: true,
  },
  // Ceramica
  {
    idUsuario: "user_pedro",
    nombre: "Taza Ceramica Pintada a Mano",
    descripcion:
      "Taza hecha con arcilla blanca y decorada con disenos geometricos pintados a mano con pintura ceramica. Apta para uso alimentario tras el esmaltado.",
    imagen: "https://loremflickr.com/600/400/ceramic,mug,handpainted?lock=11",
    visibilidad: "publico",
    dificultad: "intermedio",
    etiquetas: ["Cerámica"],
    materiales: [
      { nombre: "Arcilla blanca", categoria: "ceramica", cantidad: "0.5 kg" },
      { nombre: "Pintura ceramica azul", categoria: "pintura", cantidad: "30 ml" },
      { nombre: "Esmalte transparente ceramico", categoria: "pintura", cantidad: "50 ml" },
    ],
    herramientas: [
      { nombre: "Rodillo de ceramica", tipo: "Rodillo" },
      { nombre: "Pinceles finos", tipo: "Pinceles" },
      { nombre: "Esponja", tipo: "Otro" },
    ],
    pasos: [
      { numeroOrden: 1, descripcion: "Amasar la arcilla hasta que este uniforme y sin burbujas.", imagen: null },
      { numeroOrden: 2, descripcion: "Moldear la base con una plancha de 5mm sobre molde circular.", imagen: null },
      { numeroOrden: 3, descripcion: "Construir las paredes con churros de arcilla superpuestos.", imagen: null },
      { numeroOrden: 4, descripcion: "Alisar las paredes con los dedos humedos y la esponja.", imagen: null },
      { numeroOrden: 5, descripcion: "Modelar el asa y pegarla con barbotina.", imagen: null },
      { numeroOrden: 6, descripcion: "Dejar secar 48 horas. Lijar suavemente las imperfecciones.", imagen: null },
      { numeroOrden: 7, descripcion: "Primera coccion (bizcocho) a 1000C si tienes acceso a horno.", imagen: null },
      { numeroOrden: 8, descripcion: "Pintar los disenos geometricos con pincel fino.", imagen: null },
      { numeroOrden: 9, descripcion: "Aplicar esmalte transparente y segunda coccion.", imagen: null },
    ],
    fechaCreacion: new Date("2026-01-10"),
    activo: true,
  },
  {
    idUsuario: "user_carlos",
    nombre: "Cuenco Decorativo de Arcilla",
    descripcion:
      "Cuenco organico hecho a mano con arcilla roja. Forma irregular y natural. Perfecto para guardar llaves, joyas o como decoracion.",
    imagen: "https://loremflickr.com/600/400/ceramic,bowl,clay,handmade?lock=12",
    visibilidad: "publico",
    dificultad: "facil",
    etiquetas: ["Cerámica"],
    materiales: [
      { nombre: "Arcilla roja", categoria: "ceramica", cantidad: "0.3 kg" },
    ],
    herramientas: [
      { nombre: "Rodillo de ceramica", tipo: "Rodillo" },
      { nombre: "Espatula de modelar", tipo: "Espatula" },
      { nombre: "Esponja", tipo: "Otro" },
    ],
    pasos: [
      { numeroOrden: 1, descripcion: "Amasar la arcilla y extender con rodillo a 7mm de grosor.", imagen: null },
      { numeroOrden: 2, descripcion: "Colocar la plancha sobre un cuenco invertido como molde.", imagen: null },
      { numeroOrden: 3, descripcion: "Presionar suavemente para que tome la forma.", imagen: null },
      { numeroOrden: 4, descripcion: "Recortar los bordes de forma irregular con la espatula.", imagen: null },
      { numeroOrden: 5, descripcion: "Dejar secar 24-48 horas. Separar del molde con cuidado.", imagen: null },
      { numeroOrden: 6, descripcion: "Lijar bordes si es necesario. Listo para decorar o dejar natural.", imagen: null },
    ],
    fechaCreacion: new Date("2026-02-12"),
    activo: true,
  },
  {
    idUsuario: "user_pedro",
    nombre: "Maceta Pequena con Textura",
    descripcion:
      "Maceta de ceramica con textura en relieve hecha con sellos. Ideal para suculentas o cactus pequenos. Se trabaja con la tecnica de churros.",
    imagen: "https://loremflickr.com/600/400/ceramic,planter,pottery,texture?lock=13",
    visibilidad: "publico",
    dificultad: "intermedio",
    etiquetas: ["Cerámica"],
    materiales: [
      { nombre: "Arcilla blanca", categoria: "ceramica", cantidad: "0.4 kg" },
      { nombre: "Pintura acrilica terracota", categoria: "pintura", cantidad: "20 ml" },
    ],
    herramientas: [
      { nombre: "Rodillo de ceramica", tipo: "Rodillo" },
      { nombre: "Espatula de modelar", tipo: "Espatula" },
      { nombre: "Pinceles", tipo: "Pinceles" },
    ],
    pasos: [
      { numeroOrden: 1, descripcion: "Base: extender arcilla y cortar circulo de 8cm.", imagen: null },
      { numeroOrden: 2, descripcion: "Paredes: hacer churros de 1cm y apilar formando el cilindro.", imagen: null },
      { numeroOrden: 3, descripcion: "Alisar las uniones por dentro. Dejar textura por fuera.", imagen: null },
      { numeroOrden: 4, descripcion: "Crear texturas con sellos o tenedor en la superficie.", imagen: null },
      { numeroOrden: 5, descripcion: "Hacer agujero de drenaje en la base.", imagen: null },
      { numeroOrden: 6, descripcion: "Secar 48h. Pintar con acrilico terracota si se desea.", imagen: null },
    ],
    fechaCreacion: new Date("2026-01-30"),
    activo: true,
  },
  {
    idUsuario: "user_elena",
    nombre: "Colgante de Arcilla con Iniciales",
    descripcion:
      "Pequeno colgante personalizado con la inicial del nombre. Hecho con arcilla blanca y pintado con acrilico dorado. Incluye cordon de algodon.",
    imagen: "https://loremflickr.com/600/400/clay,pendant,necklace,jewelry?lock=14",
    visibilidad: "publico",
    dificultad: "facil",
    etiquetas: ["Cerámica"],
    materiales: [
      { nombre: "Arcilla blanca", categoria: "ceramica", cantidad: "0.05 kg" },
      { nombre: "Pintura acrilica dorada", categoria: "pintura", cantidad: "5 ml" },
      { nombre: "Cordon algodon fino", categoria: "lana", cantidad: "0.5 metros" },
    ],
    herramientas: [
      { nombre: "Rodillo de ceramica", tipo: "Rodillo" },
      { nombre: "Cortador circular pequeno", tipo: "Otro" },
      { nombre: "Pinceles finos", tipo: "Pinceles" },
      { nombre: "Palillo de modelar", tipo: "Otro" },
    ],
    pasos: [
      { numeroOrden: 1, descripcion: "Extender arcilla a 4mm con rodillo.", imagen: null },
      { numeroOrden: 2, descripcion: "Cortar circulo de 3cm con el cortador.", imagen: null },
      { numeroOrden: 3, descripcion: "Grabar la inicial con el palillo de modelar.", imagen: null },
      { numeroOrden: 4, descripcion: "Hacer agujero arriba para el cordon (con palillo).", imagen: null },
      { numeroOrden: 5, descripcion: "Secar 24h. Pintar la inicial con acrilico dorado.", imagen: null },
      { numeroOrden: 6, descripcion: "Pasar el cordon por el agujero y anudar.", imagen: null },
    ],
    fechaCreacion: new Date("2026-02-18"),
    activo: true,
  },
  {
    idUsuario: "user_carlos",
    nombre: "Portavelas Estrella de Arcilla",
    descripcion:
      "Portavelas con forma de estrella de 5 puntas. Hecho con arcilla roja y acabado rustico. Perfecto para velas de te. Crea un ambiente muy acogedor.",
    imagen: "https://loremflickr.com/600/400/ceramic,candle,holder,star?lock=15",
    visibilidad: "publico",
    dificultad: "facil",
    etiquetas: ["Cerámica"],
    materiales: [
      { nombre: "Arcilla roja", categoria: "ceramica", cantidad: "0.2 kg" },
    ],
    herramientas: [
      { nombre: "Rodillo de ceramica", tipo: "Rodillo" },
      { nombre: "Cortador estrella", tipo: "Otro" },
      { nombre: "Espatula de modelar", tipo: "Espatula" },
    ],
    pasos: [
      { numeroOrden: 1, descripcion: "Extender arcilla a 1cm de grosor.", imagen: null },
      { numeroOrden: 2, descripcion: "Cortar forma de estrella con el cortador.", imagen: null },
      { numeroOrden: 3, descripcion: "Con los dedos, crear hueco central para la vela.", imagen: null },
      { numeroOrden: 4, descripcion: "Levantar ligeramente las puntas de la estrella.", imagen: null },
      { numeroOrden: 5, descripcion: "Secar 48h. Lijar bordes si es necesario.", imagen: null },
    ],
    fechaCreacion: new Date("2026-02-22"),
    activo: true,
  },
  {
    idUsuario: "user_ana",
    nombre: "Plato Decorativo Hoja",
    descripcion:
      "Plato con forma de hoja hecho con la tecnica de impresion. Se presiona una hoja real sobre la arcilla para transferir la textura. Resultado organico y unico.",
    imagen: "https://loremflickr.com/600/400/ceramic,plate,leaf,nature?lock=16",
    visibilidad: "publico",
    dificultad: "facil",
    etiquetas: ["Cerámica"],
    materiales: [
      { nombre: "Arcilla blanca", categoria: "ceramica", cantidad: "0.25 kg" },
      { nombre: "Pintura acrilica verde", categoria: "pintura", cantidad: "10 ml" },
    ],
    herramientas: [
      { nombre: "Rodillo de ceramica", tipo: "Rodillo" },
      { nombre: "Pinceles", tipo: "Pinceles" },
      { nombre: "Cuter", tipo: "Cuter" },
    ],
    pasos: [
      { numeroOrden: 1, descripcion: "Extender arcilla a 5mm. Colocar hoja natural encima.", imagen: null },
      { numeroOrden: 2, descripcion: "Pasar el rodillo suavemente para imprimir la textura.", imagen: null },
      { numeroOrden: 3, descripcion: "Recortar alrededor de la hoja con el cuter.", imagen: null },
      { numeroOrden: 4, descripcion: "Retirar la hoja. Curvar los bordes hacia arriba.", imagen: null },
      { numeroOrden: 5, descripcion: "Secar 48h. Pintar las venas con acrilico verde diluido.", imagen: null },
    ],
    fechaCreacion: new Date("2026-02-25"),
    activo: true,
  },
];

// Inventario y proyectos propios de cada cuenta de prueba.
// El idUsuario se inyecta en runtime con el UID que devuelve Firebase Auth,
// asi el script funciona aunque las cuentas se borren y se vuelvan a crear.

const DATOS_TEST1_CROCHET = {
  materiales: [
    {
      nombre: "Ovillo algodon verde menta",
      categoria: "lana",
      color: "Verde menta",
      precio: 3.5,
      imagen: null,
      propiedades: { grosor: "3.5", metros: 200, tipoMaterial: "Algodon" },
    },
    {
      nombre: "Ovillo algodon blanco",
      categoria: "lana",
      color: "Blanco",
      precio: 2.8,
      imagen: null,
      propiedades: { grosor: "3", metros: 180, tipoMaterial: "Algodon" },
    },
    {
      nombre: "Ovillo lana acrilica beige",
      categoria: "lana",
      color: "Beige",
      precio: 2.5,
      imagen: null,
      propiedades: { grosor: "5", metros: 150, tipoMaterial: "Acrilico" },
    },
    {
      nombre: "Ovillo algodon rosa pastel",
      categoria: "lana",
      color: "Rosa",
      precio: 3.2,
      imagen: null,
      propiedades: { grosor: "3", metros: 170, tipoMaterial: "Algodon" },
    },
    {
      nombre: "Ovillo algodon negro",
      categoria: "lana",
      color: "Negro",
      precio: 2.9,
      imagen: null,
      propiedades: { grosor: "3", metros: 160, tipoMaterial: "Algodon" },
    },
    {
      nombre: "Relleno de fibra sintetica",
      categoria: "tela",
      color: "Blanco",
      precio: 5.99,
      imagen: null,
      propiedades: { tipoMaterial: "Fibra sintetica" },
    },
    {
      nombre: "Goma elastica para pelo pack x10",
      categoria: "tela",
      color: null,
      precio: 1.5,
      imagen: null,
      propiedades: { unidades: 10, tipoMaterial: "Elastico" },
    },
  ],
  herramientas: [
    {
      nombre: "Aguja de crochet 3.5mm",
      tipo: "Agujas de crochet",
      propiedades: { grosor: "3.5" },
      cantidad: 1,
    },
    {
      nombre: "Aguja de crochet 5mm",
      tipo: "Agujas de crochet",
      propiedades: { grosor: "5" },
      cantidad: 1,
    },
    {
      nombre: "Aguja lanera",
      tipo: "Agujas",
      propiedades: {},
      cantidad: 2,
    },
    {
      nombre: "Tijeras de costura",
      tipo: "Tijeras",
      propiedades: {},
      cantidad: 1,
    },
  ],
  proyectos: [
    {
      nombre: "Llavero corazon crochet",
      descripcion:
        "Pequeno llavero con forma de corazon tejido a crochet en algodon rosa. Se hace en 30 minutos y es perfecto para regalar o estrenar el ganchillo.",
      imagen: "https://loremflickr.com/600/400/crochet,heart,keychain?lock=20",
      visibilidad: "publico",
      dificultad: "facil",
      etiquetas: ["Crochet"],
      materiales: [
        { nombre: "Hilo algodon rosa", categoria: "lana", cantidad: "10 metros" },
        { nombre: "Relleno de fibra", categoria: "tela", cantidad: "1" },
      ],
      herramientas: [
        { nombre: "Aguja de crochet 3mm", tipo: "Agujas de crochet" },
        { nombre: "Tijeras", tipo: "Tijeras" },
      ],
      pasos: [
        { numeroOrden: 1, descripcion: "Anillo magico con 6 puntos bajos.", imagen: null },
        { numeroOrden: 2, descripcion: "Tejer dos esferas pequenas (los lobulos del corazon).", imagen: null },
        { numeroOrden: 3, descripcion: "Unir las dos esferas en la parte superior.", imagen: null },
        { numeroOrden: 4, descripcion: "Disminuir hasta cerrar formando la punta inferior.", imagen: null },
        { numeroOrden: 5, descripcion: "Rellenar antes de cerrar y coser la anilla del llavero.", imagen: null },
      ],
    },
    {
      nombre: "Posavasos crochet sencillo",
      descripcion:
        "Posavasos redondo tejido en punto alto. Diametro 11 cm. Ideal para principiantes que quieren practicar el trabajo en redondo con cambios de color.",
      imagen: "https://loremflickr.com/600/400/crochet,coaster,round?lock=21",
      visibilidad: "publico",
      dificultad: "facil",
      etiquetas: ["Crochet"],
      materiales: [
        { nombre: "Hilo algodon beige", categoria: "lana", cantidad: "20 metros" },
        { nombre: "Hilo algodon blanco", categoria: "lana", cantidad: "10 metros" },
      ],
      herramientas: [
        { nombre: "Aguja de crochet 3.5mm", tipo: "Agujas de crochet" },
        { nombre: "Tijeras", tipo: "Tijeras" },
      ],
      pasos: [
        { numeroOrden: 1, descripcion: "Anillo magico con 12 puntos altos.", imagen: null },
        { numeroOrden: 2, descripcion: "Vuelta 2: 2 puntos altos en cada punto (24pa).", imagen: null },
        { numeroOrden: 3, descripcion: "Vuelta 3: *1pa, aum* repetir hasta cerrar (36pa).", imagen: null },
        { numeroOrden: 4, descripcion: "Cambiar a hilo blanco y rematar con una vuelta de punto cangrejo.", imagen: null },
      ],
    },
  ],
};

const DATOS_TEST2_CERAMICA = {
  materiales: [
    {
      nombre: "Arcilla blanca de modelar",
      categoria: "ceramica",
      color: null,
      precio: 8.5,
      imagen: null,
      propiedades: { kilogramos: 1, tipoMaterial: "Arcilla blanca" },
    },
    {
      nombre: "Arcilla roja para modelar",
      categoria: "ceramica",
      color: "Rojo",
      precio: 7.9,
      imagen: null,
      propiedades: { kilogramos: 1, tipoMaterial: "Arcilla roja" },
    },
    {
      nombre: "Pintura acrilica verde bosque",
      categoria: "pintura",
      color: "Verde",
      precio: 4.2,
      imagen: null,
      propiedades: { mililitros: 100, tipoMaterial: "Acrilica" },
    },
    {
      nombre: "Pintura acrilica dorada",
      categoria: "pintura",
      color: "Dorado",
      precio: 4.5,
      imagen: null,
      propiedades: { mililitros: 50, tipoMaterial: "Acrilica" },
    },
    {
      nombre: "Pintura acrilica terracota",
      categoria: "pintura",
      color: "Terracota",
      precio: 4.0,
      imagen: null,
      propiedades: { mililitros: 100, tipoMaterial: "Acrilica" },
    },
    {
      nombre: "Cordon de algodon fino natural",
      categoria: "tela",
      color: "Crudo",
      precio: 2.5,
      imagen: null,
      propiedades: { metros: 5, tipoMaterial: "Algodon" },
    },
  ],
  herramientas: [
    {
      nombre: "Rodillo de ceramica",
      tipo: "Rodillo",
      propiedades: {},
      cantidad: 1,
    },
    {
      nombre: "Espatula de modelar",
      tipo: "Espatula",
      propiedades: {},
      cantidad: 2,
    },
    {
      nombre: "Set de pinceles variados",
      tipo: "Pinceles",
      propiedades: { numero: 5 },
      cantidad: 1,
    },
    {
      nombre: "Esponja de ceramica",
      tipo: "Otro",
      propiedades: {},
      cantidad: 1,
    },
    {
      nombre: "Cuter de precision",
      tipo: "Cuter",
      propiedades: {},
      cantidad: 1,
    },
  ],
  proyectos: [
    {
      nombre: "Bandeja organica de arcilla",
      descripcion:
        "Pequena bandeja vaciaboslsillos hecha con arcilla blanca. Borde irregular para un acabado natural. Perfecta para llaves, anillos o monedas.",
      imagen: "https://loremflickr.com/600/400/clay,tray,handmade,minimal?lock=22",
      visibilidad: "publico",
      dificultad: "facil",
      etiquetas: ["Cerámica"],
      materiales: [
        { nombre: "Arcilla blanca", categoria: "ceramica", cantidad: "0.3 kg" },
        { nombre: "Pintura acrilica dorada", categoria: "pintura", cantidad: "10 ml" },
      ],
      herramientas: [
        { nombre: "Rodillo de ceramica", tipo: "Rodillo" },
        { nombre: "Espatula de modelar", tipo: "Espatula" },
        { nombre: "Pinceles", tipo: "Pinceles" },
      ],
      pasos: [
        { numeroOrden: 1, descripcion: "Extender la arcilla a 6mm de grosor con el rodillo.", imagen: null },
        { numeroOrden: 2, descripcion: "Recortar la forma de la bandeja a mano (12x8cm aprox).", imagen: null },
        { numeroOrden: 3, descripcion: "Levantar los bordes con los dedos para crear el reborde.", imagen: null },
        { numeroOrden: 4, descripcion: "Dejar secar 48 horas sobre una superficie plana.", imagen: null },
        { numeroOrden: 5, descripcion: "Pintar el reborde con dorado para darle el toque final.", imagen: null },
      ],
    },
    {
      nombre: "Mini maceta de arcilla roja",
      descripcion:
        "Maceta pequena para cactus o suculentas. Hecha con arcilla roja y la tecnica del pellizco. Acabado rustico sin esmalte.",
      imagen: "https://loremflickr.com/600/400/clay,pot,small,terracotta?lock=23",
      visibilidad: "publico",
      dificultad: "facil",
      etiquetas: ["Cerámica"],
      materiales: [
        { nombre: "Arcilla roja", categoria: "ceramica", cantidad: "0.2 kg" },
      ],
      herramientas: [
        { nombre: "Espatula de modelar", tipo: "Espatula" },
        { nombre: "Esponja", tipo: "Otro" },
      ],
      pasos: [
        { numeroOrden: 1, descripcion: "Formar una bola de arcilla del tamano de un huevo.", imagen: null },
        { numeroOrden: 2, descripcion: "Hundir el pulgar en el centro y pellizcar hacia fuera.", imagen: null },
        { numeroOrden: 3, descripcion: "Ir girando y subiendo las paredes con los dedos humedos.", imagen: null },
        { numeroOrden: 4, descripcion: "Alisar el interior y exterior con la esponja.", imagen: null },
        { numeroOrden: 5, descripcion: "Hacer un pequeno agujero de drenaje en la base.", imagen: null },
        { numeroOrden: 6, descripcion: "Dejar secar 48-72 horas en sombra.", imagen: null },
      ],
    },
  ],
};

const CUENTAS_PRUEBA_DATOS = [
  { credenciales: CUENTAS_PRUEBA[0], datos: DATOS_TEST1_CROCHET },
  { credenciales: CUENTAS_PRUEBA[1], datos: DATOS_TEST2_CERAMICA },
];

async function seed() {
  console.log("Iniciando seed de CraftFlow...\n");

  // Importante: no limpiar "usuarios" para no borrar los documentos de las
  // cuentas reales (se actualizan con setDoc mas abajo).
  console.log("Limpiando datos existentes...");
  await limpiarColeccion("proyectos");
  await limpiarColeccion("materiales");
  await limpiarColeccion("herramientas");
  await limpiarColeccion("favoritos");

  console.log("\nCreando usuarios ficticios...");
  for (const u of USUARIOS_FICTICIOS) {
    const { id, ...datos } = u;
    await setDoc(doc(db, "usuarios", id), datos);
    console.log(`  ✓ Usuario: ${datos.nombre}`);
  }

  console.log("\nCreando proyectos publicos de usuarios ficticios...");
  for (const p of PROYECTOS) {
    await addDoc(collection(db, "proyectos"), p);
    console.log(`  ✓ Proyecto: ${p.nombre}`);
  }

  console.log("\nPreparando cuentas de prueba en Firebase Auth...");
  for (const { credenciales, datos } of CUENTAS_PRUEBA_DATOS) {
    const uid = await obtenerOCrearUsuarioAuth(
      credenciales.email,
      credenciales.password
    );

    // El documento de usuario en Firestore comparte el UID con el de Auth.
    await setDoc(doc(db, "usuarios", uid), {
      email: credenciales.email,
      nombre: credenciales.nombre,
      fotoPerfil: null,
      fechaRegistro: new Date(),
      intereses: credenciales.intereses,
      activo: true,
    });
    console.log(`    Documento usuario actualizado (${credenciales.nombre})`);

    for (const m of datos.materiales) {
      await addDoc(collection(db, "materiales"), {
        ...m,
        idUsuario: uid,
        fechaCreacion: new Date(),
      });
    }
    console.log(`    ${datos.materiales.length} materiales creados`);

    for (const h of datos.herramientas) {
      await addDoc(collection(db, "herramientas"), {
        ...h,
        idUsuario: uid,
      });
    }
    console.log(`    ${datos.herramientas.length} herramientas creadas`);

    for (const p of datos.proyectos) {
      await addDoc(collection(db, "proyectos"), {
        ...p,
        idUsuario: uid,
        fechaCreacion: new Date(),
        activo: true,
      });
    }
    console.log(`    ${datos.proyectos.length} proyectos publicados\n`);
  }

  console.log("Seed completado.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error en el seed:", error);
  process.exit(1);
});
