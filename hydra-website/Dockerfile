# Use official Nginx image
FROM nginx:stable-alpine

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy website files
COPY index.html /usr/share/nginx/html/
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
