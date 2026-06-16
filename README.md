# SATSI - Sistema de Atención de Soporte TI 🛠️

Sistema HelpDesk desarrollado para la gestión, seguimiento y resolución de incidencias de soporte técnico en entornos corporativos y sucursales retail.

Implementa una arquitectura basada en microservicios, autenticación JWT, consultas REST y GraphQL, además de un enfoque Mobile-First para optimizar la experiencia de los usuarios en punto de venta.

---

## 🚀 Características

- 📱 Reporte de incidencias desde dispositivos móviles.
- 📎 Gestión de evidencias mediante carga de imágenes y documentos PDF.
- 📊 Dashboard gerencial con métricas y monitoreo de SLA en tiempo real.
- 🔐 Seguridad basada en JWT y control de acceso por roles.
- 🏗️ Arquitectura de microservicios escalable y desacoplada.
- 🔄 Integración mediante APIs REST y GraphQL.

---

## 💻 Stack Tecnológico

### Frontend

- React.js
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Recharts

### Backend

- Java 24
- Spring Boot 3.5.14
- Spring Security
- JJWT 0.11.5
- Spring Data JPA
- Hibernate 6.6.49.Final
- REST API
- GraphQL

### Base de Datos y Herramientas

- PostgreSQL 15
- Maven
- Postman
- DBeaver

---

## 🗄️ Arquitectura de Base de Datos

El sistema utiliza dos bases de datos independientes:

| Base de Datos | Descripción |
|--------------|-------------|
| `satsi_iam_db` | Gestión de usuarios, credenciales y roles |
| `satsi_core_db` | Gestión de tickets, sucursales, inventario, evidencias y trazabilidad |

---

## ⚙️ Requisitos Previos

Instalar previamente:

- Java JDK 24
- Node.js 18+
- PostgreSQL 15+
- Maven 3.9+

---

## 🛠️ Instalación

### 1. Configurar PostgreSQL

Crear las siguientes bases de datos:

```sql
CREATE DATABASE satsi_iam_db;
CREATE DATABASE satsi_core_db;
```

Restaurar los scripts ubicados en:

```text
/database/satsi_iam_db_backup.sql
/database/satsi_core_db_backup.sql
```

### 2. Configurar Backend

Ingresar a cada microservicio:

```bash
cd iam-service
```

```bash
cd core-service
```

Configurar las credenciales de conexión en el archivo `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/satsi_core_db
    username: tu_usuario
    password: tu_password
```

Compilar y ejecutar:

```bash
mvn clean install
mvn spring-boot:run
```

Puertos utilizados:

| Servicio | Puerto |
|-----------|---------|
| Config Server | 8888 |
| IAM Service | 8082 |
| Core Service | 8080 |

### 3. Configurar Frontend

Ingresar al proyecto frontend:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Ejecutar en modo desarrollo:

```bash
npm run dev
```

Aplicación disponible en:

```text
http://localhost:5173
```

---

## 🧪 Testing

### Pruebas Unitarias

```bash
mvn test
```

Tecnologías utilizadas:

- JUnit 5
- Mockito

### Pruebas de Integración

- Colección Postman incluida en el repositorio.
- Validación de autenticación JWT.
- Validación de creación y seguimiento de tickets.

### Calidad de Software

- Evaluación basada en ISO/IEC 25010.
- Auditoría de accesibilidad mediante Google Lighthouse.
- Puntajes superiores al 90% en accesibilidad.

---

## 📂 Estructura General

```text
SATSI
│
├── frontend
├── iam-service
├── core-service
├── database
│   ├── satsi_iam_db_backup.sql
│   └── satsi_core_db_backup.sql
│
└── README.md
```

---

## 📈 Funcionalidades Principales

- Gestión de tickets de soporte.
- Administración de usuarios y roles.
- Seguimiento del ciclo de vida de incidencias.
- Gestión de evidencias adjuntas.
- Dashboard de indicadores y SLA.
- Inventario de equipos por sucursal.

---

## 📝 Autores

Proyecto Integrador de Ingeniería de Software.

Desarrollado como solución para la gestión centralizada de soporte técnico y monitoreo de incidencias.
