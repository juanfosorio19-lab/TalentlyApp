# Validación de pagos en Chile (decisión 8)

Objetivo: confirmar si Mercado Pago permite cobrar una reserva (clase o servicio), retener la comisión de Talently y depositar el resto directo a la persona (split 1:1, «marketplace»), con cuentas de personas naturales en Chile. Talently no debe custodiar fondos.

> Lo que sigue es un plan de validación. Las condiciones y precios de cada proveedor cambian: todo se confirma en la documentación oficial (seleccionando Chile) y por escrito con el equipo comercial.

## Paso 1 · Documentación (1 hora)

En el portal de desarrolladores de Mercado Pago, con el país en **Chile**, buscar la integración **Marketplace / Split de pagos** (vinculación de vendedores por OAuth y cobro con comisión del marketplace, `marketplace_fee`). Anotar:
- si la integración está disponible para Chile o solo para otros países;
- si los vendedores pueden ser **personas naturales** con cuenta Mercado Pago (no solo empresas);
- cuándo recibe el dinero el vendedor y cuándo Talently su comisión;
- cómo se hacen los reembolsos y las cancelaciones (los necesita la política de cancelación de clases).

## Paso 2 · Prueba en sandbox (1 a 2 días de desarrollo)

1. Crear una cuenta de Mercado Pago Chile para Talently y una aplicación en el panel de desarrolladores.
2. Crear usuarios de prueba: un **vendedor** (profesor) y un **comprador** (apoderado).
3. Vincular al vendedor con la aplicación por OAuth.
4. Crear un cobro de $18.000 con una comisión de Talently de 12 % y pagarlo con una tarjeta de prueba.
5. Verificar que el vendedor recibe $15.840 (menos el costo de Mercado Pago) y Talently $2.160.
6. Probar un reembolso total y uno parcial.

## Paso 3 · Reunión comercial (1 semana)

Pedir por escrito al equipo comercial de Mercado Pago:
- disponibilidad del split para Chile y requisitos para activarlo en producción;
- comisión por transacción para Talently y para el vendedor, y plazos de liberación del dinero;
- exigencias de verificación de los vendedores (KYC) y si Mercado Pago la hace;
- quién emite qué documento tributario (Talently factura su comisión; el profesor emite su boleta de honorarios).

## Paso 4 · Comparar alternativas si el split no está disponible

| Opción | Qué validar |
|---|---|
| **Flow** | Si ofrece pagos a terceros o «multicomercio» para personas naturales, y sus comisiones. |
| **Transbank Webpay Plus Mall** | Permite cobrar a varios comercios en una transacción, pero cada vendedor necesita su propio código de comercio: probablemente inviable para personas naturales. |
| **Khipu** | Transferencias bancarias con menor costo; ver si permite pagos a terceros. |
| **Plan B** | Cobrar solo planes y destacados a organizaciones (con Flow o Mercado Pago normal) y que las reservas se paguen directo al profesor, como en la Fase 2. |

## Resultado esperado

Una tabla con: disponible sí/no, costo total por una clase de $18.000, plazo de pago al profesor, manejo de reembolsos y esfuerzo de integración. Con eso se decide antes de comprometer comisiones del 10 al 12 %.
