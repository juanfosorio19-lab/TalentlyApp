---
trigger: always_on
---

# Reglas de Talently

## Stack & Arquitectura
- Diseño inspirado en Tinder: tarjetas con swipe, bordes redondeados, gestos fluidos
- Estilo minimalista, elegante, profesional y moderno
- Microanimaciones en todas las interacciones (swipe, match, transiciones)

## Perfiles
- Siempre hay dos tipos de usuario: Candidato y Empresa
- Toda lógica de swipe debe funcionar bidireccional (ambos aprueban para que haya match)
- El chat solo se habilita después de un match confirmado

## UX / UI
- Onboarding estilo Google: 1 pregunta por pantalla, con opción de omitir, volver y continuar
- Las tarjetas de swipe muestran: foto + info relevante + botones corazón y X
- Login persistente: una vez autenticado, la sesión no expira

## Código
- Manejo de errores en todos los fetch() con mensajes claros al usuario
- Variables de configuración (URLs de API, keys) siempre separadas del código
- Comentarios en español
- Nunca hardcodear credenciales ni secrets
```

---

## 2️⃣ WORKFLOWS — Comandos rápidos para tu flujo de trabajo

Crea estos archivos en:
```
tu-proyecto-talently\.agent\workflows\