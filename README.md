# Mesa Dungeon

Aplicacion web estatica para GitHub Pages.

## Estructura

- `index.html`: carga React, Babel y los modulos en orden.
- `firebase/`: inicializacion Firebase y wrappers de DB/Auth.
- `components/`: UI principal de lobby, autenticacion, owner y sala/chat.
- `systems/`: runtime, estilos globales, tutoriales, salas y controlador de app.
- `character/`: datos, calculos, retrato, hoja y creacion de personajes.
- `dice/`: sistema de dados.
- `inventory/`: items, inventario, equipamiento y billetera.
- `utils/`: reservado para utilidades futuras.

## Compatibilidad

No requiere build, npm ni framework adicional. GitHub Pages sirve los archivos estaticos y Babel Standalone transforma los `.jsx` en el navegador.

Los archivos se cargan como scripts ordenados en lugar de ES imports nativos porque el proyecto mantiene JSX sin build step. Si mas adelante se agrega Vite u otro build, estos modulos ya quedan listos para migrar a `import/export` real.
