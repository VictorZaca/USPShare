#!/bin/bash

# Reset rápido para desenvolvimento - SEM confirmação
echo "🧹 Reset rápido USPShare..."

# 1. Limpar MongoDB usando mongosh/mongo
if command -v mongosh >/dev/null 2>&1; then
    mongosh mongodb://localhost:27017/uspshare --eval "
        db.users.deleteMany({});
        db.resources.deleteMany({});
        db.comments.deleteMany({});
        db.notifications.deleteMany({});
        print('✅ Database limpo');
    " --quiet
elif command -v mongo >/dev/null 2>&1; then
    mongo mongodb://localhost:27017/uspshare --eval "
        db.users.deleteMany({});
        db.resources.deleteMany({});
        db.comments.deleteMany({});
        db.notifications.deleteMany({});
        print('✅ Database limpo');
    " --quiet
else
    echo "⚠️  MongoDB CLI não encontrado - limpe manualmente"
fi

# 2. Limpar uploads
if [ -d "backend/uploads" ]; then
    file_count=$(find backend/uploads -type f | wc -l)
    find backend/uploads -type f -delete
    echo "✅ $file_count arquivo(s) removido(s)"
else
    echo "⚠️  Pasta uploads não encontrada"
fi

# 3. Limpar tmp
if [ -d "backend/tmp" ]; then
    rm -rf backend/tmp/*
    echo "✅ Arquivos temporários limpos"
fi

echo "🚀 Reset concluído! Limpe o localStorage do navegador e inicie com ./start.sh" 