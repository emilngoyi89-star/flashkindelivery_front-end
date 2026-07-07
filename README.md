# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

**Configuration API**

- **But**: l'application utilise `axios` avec un `baseURL` configuré via la variable d'environnement `VITE_API_BASE_URL`.
- **Développement**: si `VITE_API_BASE_URL` n'est pas défini et que vous lancez l'app localement (`localhost`), l'API par défaut est `http://localhost:3000`.
- **Production**: définissez `VITE_API_BASE_URL` sur votre URL backend HTTPS, par exemple:

	```
	VITE_API_BASE_URL=https://flashkindelivery-back-end.onrender.com
	```

- Un fichier d'exemple est disponible: `.env.example` à la racine du projet.
- Après modification de `.env` (ou des variables sur votre plateforme d'hébergement), rebuild l'application:

	```bash
	npm run build
	```

La configuration dans `src/api.js` prend automatiquement `import.meta.env.VITE_API_BASE_URL` en priorité, puis bascule sur `localhost` pour le développement si nécessaire.
