## 📝 Contexto del Proyecto

Quiero desarrollar una aplicación web en React donde los usuarios puedan personalizar modelos 3D para luego exportarlos directamente en formato STL, listos para impresión 3D.

## 🎯 Objetivo Principal

- Crear un editor 3D en la web con React Three Fiber (R3F).
- Permitir al usuario personalizar plantillas existentes (ejemplo: llaveros, placas, protectores de celular, adornos).
- Permitir también que el usuario cree su propio modelo sencillo desde cero.
- Garantizar que los modelos respeten los límites de tamaño físico de la impresora 3D (ejemplo: 220x220x250 mm).
- Exportar los modelos directamente a STL para impresión.
- Guardar el resultado en el backend, ya sea como archivo STL o como parámetros de personalización.

## 🖼️ Interfaz (Mockup)

**Layout**

- Barra superior → Botones globales (“Guardar”, “Exportar STL”, “Vista previa”).
- Canvas central (R3F) → Mostrar la cama de impresión y el modelo editable.
- Panel lateral derecho → Herramientas de personalización.

**Panel lateral (funcionalidades)**

- Texto personalizado → Input + selector de fuente.
- Color / Material → Selector de color.
- Transformaciones → Escala, rotación, posición.
- Adornos → Botones para insertar formas básicas (corazones, estrellas, esferas, etc.).
- Medidas actuales del modelo en milímetros.
- Aviso de límite si excede el área de impresión.

## ⚙️ Funcionalidades Clave

- Renderizado 3D: React Three Fiber + Drei helpers.
- Controles de cámara: OrbitControls.
- Edición de objetos: TransformControls (mover, escalar, rotar).
- Cama de impresión: Representada con un plano de dimensiones reales (ej: 220x220 mm).
- Bounding box transparente: Para visualizar límites de impresión.
- Validación en tiempo real: Mostrar alertas si el modelo excede dimensiones.
- Exportación: Usar STLExporter de Three.js para descargar o enviar al backend.
- Persistencia: Guardar en base de datos el STL exportado (opción preferida) o los parámetros de personalización.

## 🔮 Futuro

- Panel de administración para ver lo que cada usuario creó.
- Descargar los STL desde el admin panel y pasarlos al slicer para imprimir.
- Posibilidad de que el usuario también cargue modelos propios en GLTF/OBJ/STL.

## 👉 En resumen


Necesito un mini-Tinkercad hecho en React, enfocado en personalización rápida de modelos y exportación a STL para impresión 3D.

---

## 🗺️ Roadmap MVP — Editor 3D para impresión

### Fase 1 — Fundamentos (Semana 1)

🔹 Objetivo: montar lo básico para ver un modelo en la cama de impresión.

- Setup proyecto: Vite + React + R3F + Drei.
- Crear el Canvas principal con cámara y luces.
- Renderizar la cama de impresión (plano 220×220 mm).
- Agregar un bounding box transparente para mostrar los límites.
- Cámara: OrbitControls (rotar/zoom sobre la cama).

✅ Entregable: una página donde ves la cama y puedes moverte alrededor.

### Fase 2 — Objetos básicos (Semana 2)

🔹 Objetivo: que el usuario pueda insertar y mover objetos.

- Botones “Agregar cubo” y “Agregar esfera”.
- Insertar geometrías en la escena.
- Selección de objetos con click.
- TransformControls para mover/rotar/escalar objetos seleccionados.

✅ Entregable: colocar un cubo o esfera, moverlo y escalarlo dentro de la cama.

### Fase 3 — Validación de límites (Semana 3)

🔹 Objetivo: que el editor entienda los límites físicos.

- Calcular Box3 de cada objeto.
- Mostrar medidas actuales en mm en un panel lateral.
- Detectar si el objeto excede los límites de impresión → mostrar alerta visual (cambiar color, tooltip, mensaje).

✅ Entregable: si un cubo se sale de la cama, aparece alerta roja.

### Fase 4 — Personalización (Semana 4)

🔹 Objetivo: permitir modificaciones útiles y divertidas.

- Input de texto 3D → usar TextGeometry o troika-three-text.
- Selector de color / material.
- Panel lateral con controles: posición, escala, rotación (inputs numéricos).

✅ Entregable: escribir tu nombre y verlo en la cama, coloreado.

### Fase 5 — Exportación (Semana 5)

🔹 Objetivo: que el usuario pueda exportar lo que hizo.

- Integrar STLExporter de Three.js.
- Exportar toda la escena o solo los objetos editables → descargar .stl.
- Validación: no permitir exportar si hay objetos fuera del área.

✅ Entregable: botón “Exportar STL” que genera un archivo imprimible.

### Fase 6 — Persistencia mínima (Semana 6)

🔹 Objetivo: guardar y recuperar proyectos.

- Backend Express simple con endpoint /upload-stl.
- Enviar STL al servidor (FormData).
- Guardar archivo en uploads/ y registrar metadatos (JSON).
- Pantalla de usuario → “Mis modelos” con lista de descargas.

✅ Entregable: usuario guarda su modelo, lo ve en su lista y lo descarga cuando quiera.


### 🔮 Futuro post-MVP (cuando el MVP ya funcione)

- Más formas (estrellas, corazones, extrusiones desde SVG).
- Operaciones booleanas (union, subtract, intersect).
- Subida de modelos propios (STL/GLTF).
- Panel de administración para gestionar pedidos de impresión.
