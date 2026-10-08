# BackButton

El único botón de volver de Talently (hoy hay 8): un IconButton ghost de 40/48 con `IconArrowLeft`.

- Marcado: `<button class="tl-iconbtn tl-backbtn" aria-label="Volver"><span class="tl-icon">IconArrowLeft</span></button>`.
- Va siempre a la izquierda del AppBar standard; nunca en el AppBar large de una pestaña.
- Vuelve SIEMPRE a la pantalla de origen (incluida la pestaña y su scroll), nunca a una ruta fija. En un asistente vuelve al paso anterior; si hay cambios sin guardar, primero «¿Descartar cambios?».
- Mismo comportamiento que el botón atrás de Android (cerrar hoja o diálogo, descartar cambios, paso anterior, pantalla anterior, Inicio).
