# SATSI - Sistema de Atención de Soporte TI 🛠️📊

SATSI es una plataforma integral de HelpDesk diseñada para la gestión, seguimiento y resolución de incidencias de soporte técnico en entornos corporativos y sucursales retail. Construido bajo una arquitectura de microservicios y un enfoque *Mobile-First*, el sistema optimiza los tiempos de respuesta (SLA) y proporciona métricas analíticas en tiempo real.

## 🚀 Características Principales

* **Reporte de Incidencias Móvil (Mobile-First):** Interfaz adaptativa que permite a los operarios (cajeros) reportar fallos directamente desde sus dispositivos móviles en el punto de venta.
* **Gestión de Evidencias:** Soporte para carga de archivos multimedia (imágenes, PDFs) adjuntos a cada ticket de soporte mediante almacenamiento local.
* **Dashboard Gerencial:** Panel analítico en tiempo real con gráficos interactivos (Recharts) para el monitoreo de SLAs, estado global de tickets e incidencias por categoría.
* **Seguridad Robusta:** Autenticación y autorización basada en Tokens JWT, con segregación de roles (Tienda, Técnico, Gerencia).
* **Arquitectura Escalable:** Separación de dominios de datos (IAM y Core) garantizando la independencia y resiliencia de los servicios, con soporte para consultas vía REST y GraphQL.

## 💻 Stack Tecnológico

**Frontend (Cliente Web)**
* React.js (TypeScript)
* Vite (Bundler)
* Tailwind CSS (Estilos UI)
* Lucide-React (Iconografía)
* Recharts (Visualización de datos)

**Backend (Microservicios)**
* Java 24 (OpenJDK)
* Spring Boot v3.5.14
* Spring Security & JJWT v0.11.5
* Spring Data JPA / Hibernate Core v6.6.49.Final
* GraphQL y API REST

**Base de Datos & Herramientas**
* PostgreSQL v15.18
* Postman (API Testing)
* DBeaver (Gestión de BD)

## 🗄️ Estructura de Base de Datos

El sistema implementa dos bases de datos lógicas independientes:
1. `satsi_iam_db`: Gestión de identidades, credenciales de usuarios y roles de acceso.
2. `satsi_core_db`: Núcleo operativo del negocio (Tickets, Sucursales, Equipos de inventario, Línea de tiempo y Evidencias).

## ⚙️ Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu entorno local:
* [Java JDK 24](https://jdk.java.net/24/)
* [Node.js](https://nodejs.org/) (v18 o superior)
* [PostgreSQL](https://www.postgresql.org/download/) (v15+)
* [Maven](https://maven.apache.org/)

## 🛠️ Instalación y Configuración Local

### 1. Configuración de Base de Datos
1. Abre tu gestor de base de datos (ej. DBeaver o pgAdmin).
2. Crea dos bases de datos vacías: `satsi_iam_db` y `satsi_core_db`.
3. Ejecuta los scripts de respaldo (`satsi_iam_db_backup.sql` y `satsi_core_db_backup.sql`) ubicados en la carpeta `/database` del repositorio para restaurar las tablas y datos semilla.

### 2. Configuración del Backend (Spring Boot)
1. Navega a los directorios de los microservicios (`core-service` e `iam-service`).
2. Configura tus credenciales de PostgreSQL en los archivos `application.yml` o `application.properties`:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/satsi_core_db
       username: tu_usuario
       password: tu_password
