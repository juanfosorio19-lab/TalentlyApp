# Revisión de la entrega de Claude Design (M12)

> **Versión 3 (8 de octubre de 2026): las 3 correcciones y las 13 variantes faltantes están hechas y verificadas.** Ver `CAMBIOS.md`. Ya no quedan tableros `FALTA-*`. La sección «Detalles a corregir» de abajo queda como historial.

Fecha: 7 de octubre de 2026. Entrega: `talently-m12-prototipos.zip` (90 pantallas de F1 y 7 de F2, sistema de diseño y capturas).

Lienzos originales en claude.ai (fuente de verdad del diseño):
- Prototipo F1: https://claude.ai/artifact/2wvNGwsBWh5F4c5jZkTpgh
- Prototipo F2: https://claude.ai/artifact/9W4VNPLMDGKxjDxTRQn73L
- Sistema de diseño: https://claude.ai/artifact/HFynWEZZGPxaarjKuVnHV1

## Resultado: aprobado para construir

- **Consistencia lograda.** Un solo botón primario, una sola AppBar por tipo, las mismas 5 pestañas (Inicio, Explorar, Actividad, Mensajes, Perfil) en todas las pantallas, insignias de verificación uniformes y una sola tipografía (Inter).
- **Tokens exactos.** `ds/talently/tokens.css` coincide con el super prompt en claro y en oscuro (primario `#6D4AFF`); no queda el azul `#1392EC`.
- **Decisiones reflejadas.** Publicación Clásica/Premium con «Pronto» (PUBL-08), «Impulsa tu perfil» con «Pronto» (PRF-12), certificado de antecedentes voluntario en el chat (MSG-02b), credencial SPD obligatoria, aviso «Sin subordinación ni dependencia» en turnos con boleta, organización verificada antes de publicar turnos, identidad con cédula y selfie (VER-02), selector de actor sin el hogar (SHT-ACTOR), «Pagas directo a la profesora» en F2 (RES-02), nombres dignos («asesor/a del hogar»).

## Detalles a corregir en Claude Design (menores)

1. **DET-01-clase:** el texto «vence 02/2028» quedó suelto al lado de la insignia «Apta para trabajar con menores». Debe ir dentro de la insignia o como línea de detalle debajo.
2. **GES-04-postulados:** la línea de nota y confiabilidad corta con un separador colgando («4,9 (22) ·» y la confiabilidad en la línea siguiente).
3. **DET-01-turno (Matías):** el turno está «a 21 km», pero Matías eligió un radio de 20 km. Ajustar el dato de ejemplo (por ejemplo, a 18 km).
4. **Variantes faltantes** que Claude Design marcó como `FALTA-*`: ACT-02 de Matías, DET-01/DET-02/DET-03/MSG-02/PRC-01 de Pedro, GES-04 de «Garzones fin de semana», INI-01 de Rosa como persona y MSG-01 de Marta (más su vista después de «Dejar de compartir»). Son variantes con otros datos de pantallas ya diseñadas; **no bloquean la construcción**.

## Cómo usar esta carpeta al construir

- `prototipo-f*/project/ds/talently/tokens.css` y `tokens.json` → base de `src/styles` (reemplazan `variables.css`).
- `prototipo-f*/project/ds/talently/components/bundle.css` → referencia de las clases `tl-*` para la librería de componentes.
- `capturas/` → referencia visual de cada pantalla (390 × 844).
- `flujos.json` → flujos y navegación de cada pantalla, legible por máquina.
- Los `.dc.html` necesitan el runtime de Claude Design para verse; para mirarlos, usar los lienzos o las capturas.
- Lo marcado como «Solo del prototipo» en `README.md` (`FALTA-*`, `INDICE-*`, alias `--f*`, zonas invisibles) no se implementa.
