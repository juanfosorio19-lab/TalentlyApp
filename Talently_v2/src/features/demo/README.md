# Datos de demostración (rediseño v3)

Mientras Supabase está pausado, las pantallas del rediseño leen de aquí: `session.tsx` elige el actor (`?demo=jorge`) y `data.ts` entrega lo que ese actor ve.
Los datos salen del prototipo F1 de Claude Design (`docs/rediseno/diseno/prototipo-f1` y `flujos.json`): textos, montos, fechas, comunas y distancias copiados tal cual; hoy en la demo es jue 10 dic 2026.
Lo que no está en el prototipo y hacía falta para que una pantalla tenga sentido lleva el comentario `// no está en el prototipo`.
`types.ts` define datos ya listos para mostrar (textos del diccionario, estados de Badge, montos como número CLP + unidad), no modelos de base de datos.
Se accede con funciones por actor: `getHomeFeed`, `getExplore`, `getPublication`, `getApplications`, `getConversations`, `getConversation`, `getNotifications`, `getAgenda`, `getProfile`, `getOrgDashboard` y sus vecinas.
Las pantallas usan solo estas funciones y estos tipos; nunca importan las constantes `DEMO_*` para filtrarlas por su cuenta.
`data.test.ts` revisa que cada actor tenga Inicio, que todo id referenciado exista, que no haya palabras prohibidas ni códigos con guion bajo y que los montos sean enteros positivos.
Cuando vuelva Supabase, cada `get…` se reemplaza por su consulta real con el mismo tipo de retorno, y `session.tsx` por Auth + Actor reales (02-arquitectura §4.2); ese día este módulo se borra completo sin tocar las pantallas.
