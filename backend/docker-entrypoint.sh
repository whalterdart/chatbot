set -e

echo "Iniciando PostgreSQL..."
service postgresql start

sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'pagana';" || true
sudo -u postgres psql -c "CREATE DATABASE pagana OWNER postgres;" || true

echo "Running prisma generate..."
npx prisma generate

echo "Executando Prisma..."
npx prisma migrate deploy

echo "Iniciando Backend..."
npm run start
