# Desarrollo de un Módulo Reutilizable de Gestión de Catálogos

**Prueba técnica — Desarrollador Full Stack**  
*Autenticación de usuarios, gestión de productos y optimización de imágenes*

## Descripción

Aplicación web Full Stack para consultar y administrar un catálogo de productos tecnológicos. Ofrece una vista pública para explorar productos y un panel de administración para registrar, actualizar y retirar artículos del catálogo.

El desarrollo responde al objetivo de la prueba técnica: implementar un **módulo reutilizable de gestión de catálogos con autenticación e imágenes optimizadas**, mediante una API REST, persistencia de datos, validaciones y una interfaz adaptable a diferentes pantallas.

## 1. Tecnologías utilizadas

| Tecnología | Uso en el proyecto |
|---|---|
| React y Vite | Interfaz web y herramientas de desarrollo del frontend |
| Tailwind CSS y Lucide React | Diseño responsive e iconografía |
| Java 21 y Spring Boot | Backend y API REST |
| Spring Security | Protección de las operaciones administrativas |
| Spring Data JPA / Hibernate | Persistencia y consultas a la base de datos |
| PostgreSQL (Supabase) | Información del catálogo y perfiles de usuario |
| Supabase Auth | Registro, inicio de sesión y tokens de autenticación |
| Supabase Storage | Almacenamiento de imágenes de productos |
| Canvas API y WebP | Redimensionamiento y compresión de imágenes |
| Git | Control de versiones |

## 2. Funcionalidades principales

### Catálogo público

- Visualización de productos con imagen, nombre, precio, categoría y disponibilidad.
- Búsqueda por nombre y filtros por categoría.
- Interfaz adaptable a computadoras y dispositivos móviles.

### Autenticación y permisos

- Registro, inicio y cierre de sesión mediante Supabase Auth.
- Diferenciación de roles **cliente** y **administrador**.
- Acceso restringido a las operaciones administrativas.

### Administración de productos

- **Crear:** registrar productos y asociar una imagen.
- **Consultar:** revisar los productos del catálogo.
- **Actualizar:** editar información y fotografías.
- **Eliminar:** retirar productos del catálogo mediante eliminación lógica.
- Consultar indicadores de productos, categorías y stock desde el panel.

### Validaciones

El frontend y el backend verifican los datos recibidos, incluyendo campos obligatorios, precios válidos, stock no negativo y categoría seleccionada.

## 3. Arquitectura de la aplicación

La solución utiliza una **arquitectura cliente-servidor, con un backend organizado por capas**:

- **Frontend (React):** presenta el catálogo, los formularios y el panel administrativo.
- **Controladores REST (Spring Boot):** reciben solicitudes HTTP y devuelven respuestas JSON.
- **Servicios:** implementan la lógica de gestión de productos.
- **Repositorios JPA:** acceden a PostgreSQL.
- **Entidades y DTO:** representan los datos persistidos y los intercambiados mediante la API.
- **Supabase Auth y Storage:** proporcionan autenticación y almacenamiento de imágenes.

**Alcance arquitectónico:** se implementó un servicio backend Spring Boot organizado por capas; no una infraestructura de múltiples microservicios independientes.

## 4. Gestión de la información

PostgreSQL, alojado en Supabase, almacena la información en tres conjuntos principales:

- **Productos:** nombre, descripción, precio, stock, categoría, estado y dirección de imagen.
- **Categorías:** clasificaciones utilizadas para organizar y filtrar el catálogo.
- **Perfiles:** asociación de cuentas autenticadas con los roles de usuario.

Cada producto se relaciona con una categoría; los perfiles se vinculan con las cuentas de Supabase Auth. Las fotografías se almacenan en **Supabase Storage** y en la base de datos se conserva su URL, evitando guardar archivos de imagen como datos binarios.

La eliminación de productos es lógica: se modifica su estado para retirarlos del catálogo sin borrar físicamente el registro.

## 5. Optimización de imágenes

Para reducir el peso de las fotografías antes de su almacenamiento, el frontend realiza este proceso:

1. El administrador selecciona una imagen JPG, PNG o WebP.
2. Se comprueba el formato y tamaño del archivo.
3. Se redimensiona la imagen conservando sus proporciones.
4. Se convierte a **WebP** mediante Canvas.
5. Se muestra la vista previa y la comparación de tamaños.
6. Al guardar el producto, se sube la imagen optimizada a Supabase Storage y se registra su URL mediante la API.

| Parámetro | Configuración implementada |
|---|---|
| Formatos de entrada | JPG, PNG y WebP |
| Tamaño máximo de entrada | 10 MB |
| Dimensión máxima | 1280 píxeles en el lado mayor |
| Formato de salida | WebP |
| Tamaño máximo del archivo optimizado | 2 MB |
| Almacenamiento | Bucket `productos`, carpeta `catalogo/` |

El porcentaje de reducción depende del archivo original. La eliminación lógica de un producto no implica la eliminación automática de su imagen almacenada.

## 6. Seguridad

- El catálogo admite consultas públicas.
- Las operaciones de creación, edición y eliminación requieren permisos de administrador.
- Supabase Auth gestiona las sesiones y los tokens JWT.
- Spring Security protege los endpoints administrativos.
- Supabase Storage aplica políticas de acceso para la subida y gestión de imágenes.
- Las contraseñas de PostgreSQL se configuran en el backend mediante variables de entorno y **no se publican en GitHub**.

## 7. API REST

La API utiliza HTTP y JSON. En el entorno local se ejecuta en `http://localhost:8080`.

| Método | Endpoint | Operación | Acceso |
|---|---|---|---|
| GET | `/api/productos` | Listar productos | Público |
| GET | `/api/productos/{id}` | Consultar un producto | Público |
| GET | `/api/categorias` | Listar categorías | Público |
| POST | `/api/productos` | Registrar un producto | Administrador |
| PUT | `/api/productos/{id}` | Actualizar un producto | Administrador |
| DELETE | `/api/productos/{id}` | Retirar un producto del catálogo | Administrador |

## 8. Cómo ejecutar el proyecto

### Requisitos previos

- Java JDK 21.
- Node.js y npm.
- Git.
- Un proyecto de Supabase con PostgreSQL, Authentication y Storage configurados.

### Paso 1. Descargar el código

Desde una terminal, clonar el repositorio y entrar a la carpeta descargada:

```bash
git clone URL_DEL_REPOSITORIO
cd NOMBRE_DE_LA_CARPETA
```

Sustituir los valores por la URL real de GitHub y el directorio creado al clonar.

### Paso 2. Preparar Supabase

La instancia de Supabase que se utilice para la evaluación debe tener:

- Las tablas y relaciones de productos, categorías y perfiles.
- Autenticación por correo y contraseña habilitada.
- Políticas de acceso para usuarios y administradores.
- Un bucket público `productos`, configurado para almacenar imágenes WebP de hasta 2 MB y restringir su subida a administradores.

**Importante:** clonar el repositorio no crea automáticamente estos recursos. Una persona que utilice su propio Supabase debe reproducir primero esta configuración. No se proporcionan contraseñas privadas de la instancia de desarrollo.

### Paso 3. Iniciar el backend (Spring Boot)

Abrir PowerShell en la carpeta principal del repositorio:

```powershell
cd backend
```

Establecer las variables de entorno **en esa misma terminal**, con los datos de la instancia Supabase utilizada:

```powershell
$env:DB_URL="jdbc:postgresql://HOST:5432/postgres?sslmode=require"
$env:DB_USER="USUARIO_POSTGRESQL"
$env:DB_PASSWORD="CONTRASENA_POSTGRESQL"
$env:SUPABASE_PROJECT_URL="https://TU_PROYECTO.supabase.co"
```

Para conexiones mediante Supabase Session Pooler, utilizar el host y usuario exactos proporcionados en **Connect**.

Iniciar el servidor:

```powershell
.\mvnw.cmd spring-boot:run
```

Comprobar que responde la API en [http://localhost:8080/api/productos](http://localhost:8080/api/productos). Se espera una respuesta JSON con los productos o una lista vacía.

### Paso 4. Iniciar el frontend (React)

Abrir **una segunda terminal** en la carpeta principal del repositorio:

```powershell
cd frontend
npm.cmd install
```

Crear `frontend/.env.local` con estos valores de la instancia Supabase:

```env
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICABLE
```

Se utiliza la **clave publicable**, nunca una clave secreta de servicio. Iniciar la interfaz:

```powershell
npm.cmd run dev
```

Abrir [http://localhost:5173](http://localhost:5173). Mantener abiertas las terminales del backend y del frontend.

### Paso 5. Comprobar las funcionalidades

1. **Catálogo:** visualizar productos, buscar por nombre y filtrar por categoría.
2. **Autenticación:** registrarse, iniciar sesión y cerrar sesión. Si la confirmación por correo está activa, completar primero ese paso.
3. **Administración:** ingresar con una cuenta cuyo perfil tenga el rol `admin`, crear un producto, editarlo y retirarlo del catálogo.
4. **Imágenes:** seleccionar una fotografía, comprobar la conversión a WebP y la vista previa, guardar el producto y verificar su imagen en el catálogo.

La cuenta administrativa debe crearse o autorizarse previamente en la instancia Supabase destinada a las pruebas.

### Paso 6. Compilar para producción

Desde la carpeta `frontend`:

```powershell
npm.cmd run build
```

Vite generará los archivos de producción en `frontend/dist`. Esta compilación se completó correctamente durante el desarrollo.

## 9. Verificaciones realizadas

Durante el desarrollo se trabajó con el catálogo público, registro e inicio de sesión, filtros, CRUD administrativo y tratamiento de imágenes. Además, se confirmó una compilación exitosa del frontend mediante Vite.

No se declara un despliegue público ni una batería de pruebas automatizadas completados.

## 10. Alcance

La aplicación corresponde a un **módulo reutilizable de gestión de catálogos**. No incluye carrito de compras ni procesamiento de pagos.

Se desarrolló y probó en un entorno local. Un despliegue público requiere configurar las direcciones del backend, las variables de entorno y los permisos de acceso entre orígenes (CORS).

## 11. Conclusión

El desarrollo integra React, Spring Boot, PostgreSQL y Supabase para gestionar un catálogo mediante una API REST, con autenticación, control de permisos, validaciones y optimización de imágenes WebP. La separación por capas favorece el mantenimiento y la futura ampliación de la solución.
