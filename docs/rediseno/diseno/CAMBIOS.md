# Talently · M12 · Prototipos navegables · versión 3 (solo cambios)

Este paquete trae únicamente lo que cambió respecto de la versión anterior (`talently-m12-prototipos.zip`). Las rutas son las mismas: descomprímelo sobre esa carpeta y borra los 4 tableros `FALTA-*` y sus capturas (lista al final).

Lienzos ya actualizados: Prototipo F1 versión 3 y Prototipo F2 versión 3.

## Correcciones

1. **«vence MM/AAAA» suelto** (DET-01-clase, F2): ahora es una línea de detalle en Caption debajo de la insignia «Apta para trabajar con menores». Usaba una clase que no existe en la librería (`tl-caption`) y por eso quedaba suelto. El mismo arreglo va en GES-02-hogar (F1), donde pasaba lo mismo en los 4 postulantes.
2. **«·» colgando en GES-04-postulados**: en las filas con botón «Confirmar», la nota y «Confiabilidad …» van en dos líneas (dos líneas de detalle del ListItem), sin separador. Igual en la nueva GES-04-finde-postulados.
3. **Distancia de Matías**: «a 18 km · Las Condes» en DET-01-turno y en todas las tarjetas de Las Condes que ve Matías (Main y EXP-02), porque su radio es 20 km.

## Pantallas que completan los flujos (nuevas)

- `ACT-02-matias.dc.html`
- `DET-01-empleo-pedro.dc.html`
- `DET-02-exito-pedro.dc.html`
- `DET-02-pedro.dc.html`
- `DET-03-pedro.dc.html`
- `GES-04-finde-postulados.dc.html`
- `GES-04-finde.dc.html`
- `INI-01-rosa.dc.html`
- `MSG-01-marta.dc.html`
- `MSG-02-pedro.dc.html`
- `MSG-02b-marta-no-disponible.dc.html`
- `PRC-01-pedro.dc.html`
- `SHT-ACTOR-persona.dc.html`

Son la misma pantalla aprobada con los datos de su persona o de su turno; la tabla del README dice de qué tablero sale cada una.

## Tableros que cambian

- `DET-01-turno.dc.html`
- `EXP-01.dc.html`
- `EXP-02.dc.html`
- `GES-02-hogar.dc.html`
- `GES-04-postulados.dc.html`
- `GES-04-sin-postulados.dc.html`
- `INDICE-F1.dc.html`
- `MSG-02b-marta.dc.html`
- `Main.dc.html`
- `NOT-01.dc.html`
- `SHT-ACTOR.dc.html`
- `TUR-01.dc.html`
- `TabBar.dc.html`
- `prototipo-f2: DET-01-clase.dc.html`
- `prototipo-f2: TabBar.dc.html`

- Correcciones: DET-01-turno, EXP-02, Main (18 km); GES-02-hogar, DET-01-clase (vence); GES-04-postulados (dos líneas).
- Rutas hacia las variantes nuevas: DET-01-turno (Ver mis postulaciones → ACT-02-matias), TUR-01 (atrás → ACT-02-matias), EXP-01 (tarjeta → DET-01-empleo-pedro), GES-04-sin-postulados (salto de tiempo → GES-04-finde-postulados; atrás → GES-01-turno), SHT-ACTOR (Rosa Muñoz → INI-01-rosa), NOT-01 (atrás → INI-01-rosa), MSG-02b-marta (estado «off», «Dejar de compartir» → MSG-02b-marta-no-disponible, atrás → MSG-01-marta).
- TabBar: Matías → Actividad abre ACT-02-matias; nuevas personas `rosa-persona` y `marta`.
- INDICE-F1 y `prototipo-f1/project/canvas.json`: páginas de los flujos 2, 3, 4, 7 y 10 y notas de consistencia.

## Capturas que cambian sin cambiar su archivo

AUTH-08-codigo, DET-01-turno--f9, DET-01-turno-postulado, EXP-02-turnos-desplazado, EXP-02-turnos-desplazado--f9, INI-01-salir y Main--f9 muestran «a 18 km» porque importan un tablero corregido.

## Eliminados (borrar de la versión anterior)

- `prototipo-f1/project/FALTA-ACT-02-matias.dc.html`
- `prototipo-f1/project/FALTA-DET-01-pedro.dc.html`
- `prototipo-f1/project/FALTA-INI-01-rosa.dc.html`
- `prototipo-f1/project/FALTA-MSG-01-marta.dc.html`
- `capturas/f1/FALTA-ACT-02-matias.png`
- `capturas/f1/FALTA-DET-01-pedro.png`
- `capturas/f1/FALTA-INI-01-rosa.png`
- `capturas/f1/FALTA-MSG-01-marta.png`

`README.md` y `flujos.json` vienen completos y actualizados.
