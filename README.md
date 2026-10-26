# 🐓 Aves Ornamentales - App Móvil

> Aplicación móvil híbrida (Android & iOS) diseñada especialmente para criadores de aves de raza y ornamentales. Optimizada para uso en entornos rurales con funcionamiento **100% Offline-First**, botones grandes y diseño de alto contraste.

---

## 📱 Captura de Pantallas y Funcionalidades

### 1. 🐔 Gallinero (Inventario de Aves)
- Registro completo de ejemplares: raza, sexo, color, número de anilla/identificador y fecha de nacimiento/adquisición.
- Captura y galería de fotos mediante cámara y almacenamiento local.
- Búsqueda y filtrado rápido por raza, estado o número de anilla.
- Ficha individual detallada con historial y estado de salud.

### 2. 🥚 Incubadora (Control de Incubación)
- Seguimiento visual del ciclo de incubación día a día con barra de progreso.
- Fechas clave automatizadas: día de ovoscopía (miraje), día de detención de volteo y fecha estimada de eclosión.
- Notificaciones locales programadas automáticamente en el dispositivo al iniciar la incubación.
- Registro de resultados (huevos fértiles, eclosionados, efectividad).

### 3. 📋 Tareas y Manejo Sanitario
- Calendario de actividades periódicas: desparasitaciones, vacunaciones, desinfección de gallineros y cambios de nidos.
- Sistema de recordatorios y alertas locales con fecha y hora programada.
- Clasificación por prioridad y estado (pendiente / completada).

### 4. 💎 Modelo Freemium
- Versión gratuita con límites configurables de ejemplares y procesos de incubación activos.
- Desbloqueo de registros ilimitados mediante versión Premium.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
|---|---|
| **Framework** | [React Native 0.88](https://reactnative.dev/) / [Expo SDK 58](https://docs.expo.dev/) |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) |
| **Base de Datos** | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (Modo Offline-First) |
| **Navegación** | [@react-navigation/native-stack](https://reactnavigation.org/) + Bottom Tabs v7 |
| **Notificaciones** | [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) (Locales nativas) |
| **Multimedia** | [expo-camera](https://docs.expo.dev/versions/latest/sdk/camera/), [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/image-picker/) |
| **Estilos & UI** | Sistema de diseño oscuro y alto contraste para visibilidad al aire libre |
| **Build System** | [EAS (Expo Application Services)](https://docs.expo.dev/eas/) |

---

## 📂 Estructura del Proyecto

```text
├── App.tsx                     # Componente principal y configuración de tema
├── app.json                    # Configuración de Expo y metadatos nativos
├── eas.json                    # Perfiles de compilación para EAS Build
├── index.ts                    # Punto de entrada de la aplicación
├── package.json                # Dependencias y scripts
├── assets/                     # Iconos, splash screen e imágenes de la app
└── src/
    ├── context/                # Contexto global (AppContext, estado de suscripción)
    ├── navigation/             # Navegación (Tabs, Stacks, rutas)
    ├── screens/                # Pantallas de la aplicación
    │   ├── GallineroScreen.tsx       # Lista y filtros de aves
    │   ├── AddBirdScreen.tsx         # Formulario de registro/edición de ave
    │   ├── IncubadoraScreen.tsx      # Lotes de incubación activos e historial
    │   ├── AddIncubationScreen.tsx   # Configuración de nueva incubación
    │   ├── TareasScreen.tsx          # Gestión de tareas y alertas sanitarias
    │   ├── AddTaskScreen.tsx         # Programación de nueva tarea
    │   └── PremiumScreen.tsx         # Pantalla de suscripción / activación
    ├── services/               # Servicios de base de datos SQLite y notificaciones
    ├── theme/                  # Paleta de colores, tipografías y espaciados
    └── types/                  # Definiciones de tipos TypeScript
```

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- [Git](https://git-scm.com/)
- Cuenta gratuita en [Expo](https://expo.dev) (opcional, requerida para EAS Build)

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU-USUARIO/aves-ornamentales.git
cd aves-ornamentales
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar el servidor de desarrollo

```bash
npx expo start
```

> **Nota para pruebas en dispositivo físico:**  
> Dado que la app utiliza módulos nativos (`expo-sqlite`, `expo-notifications`, `expo-camera`), se recomienda ejecutarla con un **Development Build** (`npx expo start --dev-client`) o compilando un APK de vista previa mediante EAS.

---

## 📦 Compilación de APK y Aplicación Independiente (EAS Build)

La app cuenta con perfiles configurados en `eas.json` para generar archivos de instalación standalone que **no requieren tener el servidor de desarrollo encendido**:

### 1. Iniciar sesión en EAS CLI

```bash
npx eas-cli@latest login
```

### 2. Generar APK para Android (Instalable directamente)

```bash
npx eas-cli@latest build --profile preview --platform android
```
Al finalizar la compilación en la nube de Expo, obtendrás un enlace y un código QR para descargar el archivo `.apk` directamente en tu dispositivo Android.

### 3. Generar compilación para iOS

```bash
npx eas-cli@latest build --profile preview --platform ios
```
*(Requiere cuenta de Apple Developer para distribución interna / ad-hoc).*

---

## 📤 Instrucciones para subir este proyecto a GitHub

Si aún no has vinculado este proyecto a un repositorio de GitHub:

1. Crea un nuevo repositorio en [GitHub](https://github.com/new) (por ejemplo: `aves-ornamentales`). **No marques** "Add a README" ni "Add .gitignore" ya que el proyecto ya los incluye.
2. Abre la terminal en la carpeta del proyecto y ejecuta:

```bash
# 1. Agregar todos los archivos al seguimiento de Git
git add .

# 2. Crear el primer commit
git commit -m "feat: Versión inicial Aves Ornamentales MVP"

# 3. Renombrar la rama a main (opcional pero recomendado)
git branch -M main

# 4. Vincular el repositorio remoto (reemplaza con tu URL de GitHub)
git remote add origin https://github.com/TU-USUARIO/aves-ornamentales.git

# 5. Subir los cambios a GitHub
git push -u origin main
```

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.
