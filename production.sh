#!/bin/bash

echo "🚀 Iniciando aplicação YOU em modo produção..."

# Kill existing processes
echo "Parando processos existentes..."
pkill -f "node server.js" || true
pkill -f "yarn start" || true

# Start MongoDB
echo "Verificando MongoDB..."
sudo systemctl start mongod || true

# Install dependencies if needed
echo "Verificando dependências..."
cd /app/backend
npm install --production

cd /app/frontend  
yarn install --production=false

# Build frontend for production
echo "Construindo frontend para produção..."
yarn build

# Start backend in production mode
echo "Iniciando backend em produção..."
cd /app/backend
NODE_ENV=production node server.js > /var/log/you_backend.log 2>&1 &

# Start frontend production server
echo "Iniciando frontend em produção..."
cd /app/frontend
yarn start > /var/log/you_frontend.log 2>&1 &

# Wait and verify
sleep 5

echo "Verificando serviços..."
if curl -s http://localhost:8001/health > /dev/null; then
    echo "✅ Backend rodando: http://localhost:8001"
else
    echo "❌ Backend não está respondendo"
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend rodando: http://localhost:3000"  
else
    echo "❌ Frontend não está respondendo"
fi

echo ""
echo "🎉 YOU - Seu Gêmeo IA está rodando!"
echo "🔗 Acesse: http://localhost:3000"
echo "📊 API: http://localhost:8001/api"
echo ""
echo "📝 Logs:"
echo "Backend: tail -f /var/log/you_backend.log"
echo "Frontend: tail -f /var/log/you_frontend.log"