FROM node:16-slim

# Install dependencies for Puppeteer and Chrome
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libxtst6 \
    libx11-xcb1 \
    libpangocairo-1.0-0 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libglib2.0-0 \
    libnss3 \
    libcups2 \
    libxrandr2 \
    libasound2 \
    libatk1.0-0 \
    libgtk-3-0 \
    libdrm2 \
    libgbm1 \
    xvfb \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app source
COPY . .

# Build React app
RUN npm run build:react

# Expose port for potential web service
EXPOSE 3000

# Set up environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome \
    NODE_ENV=production

# Set up entrypoint script
RUN echo '#!/bin/bash\nxvfb-run --server-args="-screen 0 1280x720x24" npm start "$@"' > /entrypoint.sh \
    && chmod +x /entrypoint.sh

# Run headless with Xvfb
ENTRYPOINT ["/entrypoint.sh"] 