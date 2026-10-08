# VerificationBadge

Insignia de confianza: dice qué verificó Talently. Se toca y abre una hoja con qué se verificó y cuándo.

- Marcado: `button.tl-verify` (+ `--verified`, `--review`, `--expired`) con ícono de 16 y texto; alto 24 con área táctil de 48.
- 4 estados:
  - Sin verificar: neutral, `IconInfo`.
  - En revisión: info, `IconClock`.
  - Verificado: success, `IconShield`, el único que usa el escudo.
  - Vencido: danger, `IconAlert`.
- Niveles con el mismo componente: Cuenta básica (sin insignia), «Teléfono verificado», «Identidad verificada»; para organizaciones, «Organización verificada».
- Solo con verificación real: nunca «Verificado» sin respaldo. La hoja nunca muestra RUT, fecha de nacimiento ni fotos de la cédula.
- **No se parece a PromotedBadge**: este es de color, con escudo y tocable; «Destacado» es neutro, con borde, flecha que sube y no se toca. Nunca van pegados: la verificación junto al nombre, «Destacado» en la esquina.
