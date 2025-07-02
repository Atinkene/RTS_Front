# Étape 1 : Build de l'application
FROM node:18 AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers nécessaires
COPY package*.json ./
RUN npm install
RUN npm install react-scripts


COPY . .

# Build de l'application React
RUN npm run build

# Étape 2 : Serveur Nginx pour servir l'application
FROM nginx:alpine

# Copier les fichiers de build dans le dossier de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copier la configuration de Nginx personnalisée si nécessaire
# COPY nginx.conf /etc/nginx/nginx.conf

# Exposer le port 80
EXPOSE 80

# Commande par défaut
CMD ["nginx", "-g", "daemon off;"]
