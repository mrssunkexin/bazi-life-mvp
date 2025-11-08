#!/bin/bash

echo "🚀 Setting up BaZi Life Analysis MVP..."

# Check if .env exists
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cat > .env << EOF
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="admin123"
EOF
  echo "✅ .env file created"
else
  echo "✅ .env file already exists"
fi

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Push schema to database
echo "🗄️  Creating database..."
npx prisma db push

# Seed database (optional)
read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🌱 Seeding database..."
  npx prisma db seed
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "Then visit http://localhost:3000"
