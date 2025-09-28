
---

## 🏗️ Arquitectura de Componentes React

### 1. App.jsx

🔹 Punto de entrada, organiza layout general.

Renderiza TopBar, EditorCanvas y Sidebar.

Maneja estado global (ej. con Zustand o Context) → objetos en escena, seleccionado, alertas.

```jsx
<App>
	<TopBar />
	<div className="layout">
		<EditorCanvas />
		<Sidebar />
	</div>
</App>
```

### 2. TopBar.jsx

🔹 Barra superior con acciones globales.

Botones: Guardar, Exportar STL, Reset.

Estado global: llama a funciones del store (ej. exportar escena).

### 3. EditorCanvas.jsx

🔹 Contiene el `<Canvas>` de React Three Fiber.

Luces + cámara + OrbitControls.
Cama de impresión (PrintBed).
Renderizado de objetos (SceneObjects).
Maneja selección y TransformControls.

**Subcomponentes:**

- PrintBed.jsx → renderiza cama y límites.
- SceneObjects.jsx → itera sobre la lista global de objetos y los dibuja.
- TransformWrapper.jsx → añade TransformControls al objeto seleccionado.

### 4. Sidebar.jsx

🔹 Panel lateral de herramientas.

Tabs (ej. Propiedades, Insertar, Alertas).

- ObjectProperties.jsx → sliders/inputs para posición, rotación, escala.
- InsertMenu.jsx → botones “Agregar cubo”, “Agregar esfera”, “Texto”.
- AlertsPanel.jsx → muestra si objeto excede límites o advertencias.

### 5. ObjectList.jsx

🔹 Lista de objetos en la escena.

Muestra nombre, tipo y un botón de eliminar.
Permite seleccionar objeto.
Estado sincronizado con el store global.

### 6. Store (Zustand o Context)

🔹 Estado centralizado de la aplicación.

Lista de objetos: `{ id, type, meshProps, materialProps }`.
Objeto seleccionado.
Funciones: addObject, updateObject, removeObject, setSelected.
Alertas de validación.

**Ejemplo en Zustand:**

```js
const useStore = create((set) => ({
	objects: [],
	selected: null,
	addObject: (obj) => set((s) => ({ objects: [...s.objects, obj] })),
	updateObject: (id, props) => set((s) => ({
		objects: s.objects.map(o => o.id === id ? { ...o, ...props } : o)
	})),
	setSelected: (id) => set({ selected: id })
}));
```

### 7. STL Exporter Service

🔹 Utilidad en `/utils/exportSTL.js`.

Toma los objetos del store.
Convierte escena a STL con STLExporter.
Devuelve Blob o descarga archivo.

---

## 📐 Flujo típico de usuario

1. Usuario entra → ve cama vacía.
2. En Sidebar > Insertar, agrega un cubo.
3. El cubo aparece en `objects[]` del store → se renderiza en EditorCanvas.
4. Hace click sobre el cubo → se selecciona → aparece TransformControls.
5. Ajusta posición y escala → Sidebar muestra medidas en tiempo real.
6. Si se sale de los límites → aparece alerta en AlertsPanel.
7. Pulsa “Exportar STL” en TopBar → se descarga modelo.stl.

---

## 📦 Resumen de carpetas frontend

```text
/src
	/components
		App.jsx
		TopBar.jsx
		EditorCanvas.jsx
			PrintBed.jsx
			SceneObjects.jsx
			TransformWrapper.jsx
		Sidebar.jsx
			ObjectProperties.jsx
			InsertMenu.jsx
			AlertsPanel.jsx
		ObjectList.jsx
	/store
		useStore.js
	/utils
		exportSTL.js
```
