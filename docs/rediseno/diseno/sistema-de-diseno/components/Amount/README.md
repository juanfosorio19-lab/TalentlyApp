# Amount

El único formato de dinero: monto + «líquidos» o «brutos» (solo en sueldos y tarifas) + unidad.

- Marcado: `span.tl-amount` (`--sm` 14, md 16, `--lg` 20) > prefijo opcional («Desde ») + `.tl-amount__value` (700, `color-text`, cifras tabulares) + resto en `color-text-2`.
- Ejemplos fijos: «$650.000 líquidos al mes», «$35.000 líquidos por turno», «$6.500 líquidos por hora», «$18.000 por clase de 60 min», «Desde $25.000 por visita»; sin monto, «Sueldo a convenir».
- CLP con punto de miles y sin decimales. Las unidades salen del diccionario (al mes, por día, por hora, por turno, por evento, por visita, por clase, por proyecto, A convenir).
- El mismo monto se ve igual en tarjeta, detalle y perfil; solo cambia el tamaño.
- **Desglose de pago** (`dl.tl-breakdown`, M10): filas concepto / monto (cifras tabulares, a la derecha) y el total abajo, separado con un divisor y en 600/700. El cargo de servicio de Talently, si se cobra al cliente, va en su propia línea. Lo usan RES-02 (pagar) y SRV-02 (Pagado, Reembolsado: «Te devolvimos»).
