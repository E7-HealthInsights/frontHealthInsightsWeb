---
description: Commit cambios de la rama actual, push a origin y abre PR a develop con el template del repo
---

Tu tarea es hacer shipping de los cambios de la rama actual contra `develop`.

## Paso 1 — Commit

- Corre `git status` y `git diff` (en paralelo) para ver el estado.
- Si hay cambios sin commitear:
  - Stagea archivos específicos por nombre (no uses `git add -A` / `git add .`).
  - Revisa `git log --oneline -5` para seguir el estilo de mensajes del repo.
  - Haz un commit con mensaje claro en español que enfatice el **por qué** del cambio.
- Si no hay cambios pendientes, continúa al Paso 2.

## Paso 2 — Push

- Pushea la rama actual a `origin`. Si no tiene upstream, usa `git push -u origin HEAD`.
- Si el `push` imprime un mensaje de "This repository moved" con otra org/repo, recuérdalo: vas a necesitar pasar `--repo <org>/<repo>` en el paso siguiente.

## Paso 3 — Pull Request

Crea el PR contra `develop`:

```
gh pr create --base develop --title "<título>" --body "$(cat <<'EOF'
...body...
EOF
)"
```

- Agrega `--repo <org>/<repo>` si el remote redirigió en el paso anterior.
- **Título**: corto (< 70 chars), resumen del cambio, en español, estilo `tipo: descripción` (`feat:`, `fix:`, `refactor:`, etc.).
- **Body**: usa EXACTAMENTE este template, llenando cada sección según los cambios reales de la rama:

```markdown
## ¿Qué hace este PR?

<descripción breve de qué implementa o cambia>

## ¿Por qué?

<contexto: historia de usuario, RNF, o problema que resuelve>

## ¿Cómo?

<decisiones técnicas relevantes; usa subsecciones si hay varias partes>

## Archivos

- `ruta/al/archivo` ← nuevo / modificado — qué hace

## Screenshots

_Pendiente de agregar. Para backend: respuestas en Postman. Para frontend: flujo visual._

## Relacionado

HU__
```

### Reglas para llenar el template

- **Archivos**: usa `git diff --name-status develop...HEAD` y lista UN item por archivo real tocado en la rama (no solo el último commit). Marca cada uno como `nuevo` o `modificado` según corresponda y agrega una línea describiendo qué hace / qué cambió.
- **¿Qué hace este PR?** y **¿Cómo?**: derívalos del diff real y de los commits de la rama (`git log develop..HEAD --oneline`).
- **¿Por qué?**: úsalo para el contexto de negocio/HU. Si el usuario dio contexto en la conversación o en los argumentos del comando, úsalo. Si no hay información clara, escribe `_Pendiente: completar con el contexto de la historia de usuario._` y avísale al usuario al final.
- **Relacionado**: si el usuario pasó un número de HU/RNF en los argumentos del comando o se infiere del nombre de la rama (ej. `feature/HI-482-...` → `HU HI-482`), úsalo. Si no, deja `HU__` literal como placeholder.
- **Screenshots**: deja la nota de pendiente tal cual; el usuario las agrega manualmente después.
- **NO agregues** secciones de "Test plan", "🤖 Generated with Claude Code", ni Co-Authored-By al body del PR — solo el template de arriba.

## Al terminar

- Imprime la URL del PR devuelta por `gh pr create`.
- Si alguna sección quedó como "Pendiente", menciónalo explícitamente para que el usuario la complete.

## Argumentos del usuario

Si el usuario pasó argumentos al comando, úsalos como contexto adicional (ej. número de HU, resumen del cambio, enlaces):

$ARGUMENTS
