# Étape 1 : build de l'application React
FROM node:18 AS build
WORKDIR /app

# Copier les fichiers de dépendances et installer
COPY package*.json ./
RUN npm install

# Copier tout le code source
COPY . .

# Lancer le build
RUN npm run build

# Étape 2 : serveur Nginx pour servir le build
FROM nginx:alpine

# Copier le build dans le dossier web de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# (Optionnel) Ajouter nginx.conf si tu utilises React Router
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
