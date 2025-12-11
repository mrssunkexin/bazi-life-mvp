#!/bin/bash

echo "=== 测试场景1: 算法模式 + 无兑换码 ==="

curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试算法模式",
    "gender": "male",
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "city": "北京"
  }'

echo ""
echo ""
