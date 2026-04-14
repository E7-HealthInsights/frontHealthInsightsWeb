# HealthInsights - Documentacion General del Sistema

## Informacion del Proyecto

- **Materia:** TC3004B - Planeacion de Sistemas de Software
- **Grupo:** 102
- **Semestre:** Febrero - Junio 2026
- **Equipo 7 - Naganiom:**
  - Santiago Ramirez Nino - A01665906
  - Gabriel Gutierrez Guerra - A01660505
  - Omar Llano Tostado - A01666730
  - Alejandro Ignacio Vargas Cruz - A01659714

---

## Descripcion General

HealthInsights es un sistema de informacion estrategica enfocado en el **analisis epidemiologico y financiero de la diabetes en Mexico**. La plataforma integra datos oficiales nacionales para transformar estadisticas de salud en herramientas interactivas de simulacion, proyeccion y toma de decisiones.

Mas que un dashboard informativo, es una herramienta de planeacion estrategica basada en datos reales que:

- Integra datos dispersos en una sola plataforma estrategica.
- Convierte estadisticas en herramientas reales de toma de decisiones.
- Justifica inversiones en prevencion con base cuantitativa.

---

## Stakeholders y Roles de Usuario

| Rol | Necesidad Principal | Valor del Sistema |
|-----|---------------------|-------------------|
| **Director General** | Planear politicas publicas | Toma de decisiones estrategicas a nivel nacional, analisis de impacto presupuestal |
| **Director de Finanzas** | Generar ahorros en salud publica | Monitoreo de gasto, proyeccion de costos futuros, sostenibilidad financiera |
| **Director de Mercadotecnia** | Disenar campanas especificas | Segmentacion demografica para campanas de prevencion focalizadas |
| **Administrador** | Gestionar accesos y sistema | Administracion de usuarios, fuentes de datos y monitoreo de actividad |
| **Usuario diabetico** | Monitorear su salud | Calculo de IMC, probabilidad de enfermar, recomendaciones (fuera de alcance MVP) |

---

## EPICs del Sistema

| ID | EPIC | Prioridad | MVP |
|----|------|-----------|-----|
| E01 | Director General | Alta | Si |
| E02 | Director de Finanzas | Alta | Si |
| E03 | Director de Mercadotecnia | Media | Si |
| E04 | Administrador | Alta | Si |
| E05 | Autenticacion | Alta | Si |
| E06 | Usuario diabetico | Baja | No |
| E07 | Simulacion | Media | No |

---

## Funcionalidades Principales

### Autenticacion y Sesion
- Inicio de sesion con usuario y contrasena (Firebase Auth)
- Cierre de sesion
- Control de acceso basado en roles (RBAC)
- Expiracion automatica de sesion tras 12h de inactividad
- Contrasenas robustas (8+ caracteres, mayusculas, minusculas, numeros, especial)

### Dashboard del Director General
- Visualizacion de cifras de diabetes y prevalencia nacional
- Comparacion de tendencias historicas
- Personalizacion de elementos del dashboard (graficas, tablas, KPIs)
- Analisis de presupuesto institucional destinado a diabetes
- Generacion y exportacion de reportes ejecutivos en PDF
- Visualizacion de reportes generados
- Simulacion de escenarios de intervencion
- Guardado y consulta de simulaciones

### Dashboard del Director de Finanzas
- Comparacion de gasto real vs presupuesto planeado
- Exportacion de datos a XLSX, CSV o PDF
- Visualizacion de reportes generados
- Mapa de costo promedio por paciente por region
- Proyeccion de gasto futuro considerando inflacion medica
- Simulaciones de ahorro acumulado por escenarios de inversion

### Dashboard del Director de Mercadotecnia
- Mapa de calor de prevalencia por entidad federativa
- Analisis de prevalencia por grupo etario (prioridad: sector infantil)
- Analisis de incidencia por nivel socioeconomico
- Personalizacion de dashboard
- Generacion de reportes visuales segmentados
- Proyeccion de crecimiento por estado

### Panel del Administrador
- CRUD de usuarios del sistema
- Asignacion de roles
- Visualizacion de conjuntos de datos cargados
- Carga y actualizacion de datasets oficiales (CSV)
- Monitoreo de actividad reciente del sistema
- Generacion de reportes tecnicos

---

## Stack Tecnologico

| Componente | Tecnologia |
|------------|------------|
| **Frontend** | React (aplicacion web) |
| **Backend** | API REST desplegada en Cloud Run (GCP) |
| **Base de Datos** | Cloud SQL (GCP) |
| **Autenticacion** | Firebase Auth |
| **Hosting Frontend** | Firebase Hosting |
| **Almacenamiento** | Cloud Storage (GCP) |
| **CI/CD** | Cloud Build (GCP) |

---

## Requerimientos No Funcionales Clave

| Categoria | RNF | Especificacion |
|-----------|-----|----------------|
| **Seguridad** | RNF-01 a RNF-05 | Autenticacion, RBAC, auditoria, contrasenas seguras, sesion 12h |
| **Usabilidad** | RNF-06 a RNF-10 | Intuitivo, retroalimentacion visual, consistencia, max 3 clicks, <5 min |
| **Rendimiento** | RNF-11 a RNF-15 | Respuesta <3s, carga <3s, 1000 usuarios concurrentes, reporte <10s |
| **Disponibilidad** | RNF-16 a RNF-20 | 99% uptime, respaldos diarios, Chrome 140+/Safari 26+/Firefox 143+ |
| **Fiabilidad** | RNF-21 a RNF-25 | Tasa de fallos <1%, recuperacion automatica, transaccionalidad |
| **Mantenibilidad** | RNF-26 a RNF-32 | Documentacion 95%, resolucion <48h, modular, escalable |

---

## Modelo de Negocio (SaaS)

| Plan | Usuarios | Precio Mensual |
|------|----------|----------------|
| Basico (hospitales, municipios) | 4 usuarios | $3,000 |
| Profesional (estados, ciudades) | 20 usuarios | $6,000 |
| Enterprise (gobierno federal) | 60 usuarios | $10,000 |
| Usuario extra | 1 usuario | $299 |

---

## Fuentes de Datos

El sistema integra datos de al menos 5 fuentes oficiales:
- INEGI
- IMSS
- ISSSTE
- Secretaria de Salud
- Estudios academicos y organismos internacionales (OMS)

---

## Metodologia de Desarrollo

- **Enfoque hibrido:** PMBOK (planeacion) + Scrum (desarrollo)
- **Sprints:** 2 semanas
- **Duracion del proyecto:** Febrero - Junio 2026 (~4 meses)
- **Lider del proyecto:** Santiago Ramirez Nino

---

## Referencia de Documentos

- SRS: `Evidencia 1 - SRS HealthInsights (ISO/IEC/IEEE 29148)`
- Plan del Proyecto: `TC3004B Plan del proyecto_E7_HealthInsights`
- Diseno Figma: https://www.figma.com/design/POQTMEpwq66EwcVuYTpJIs/DAB
- Jira: https://health-insights.atlassian.net
