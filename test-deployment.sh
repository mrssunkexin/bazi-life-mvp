#!/bin/bash

# 微信云托管部署验证脚本
# 使用方法: bash test-deployment.sh

DOMAIN="https://zhibaitang-bazisever-207188-4-1391586262.sh.run.tcloudbase.com"
TOKEN="bazi_life_2025_secure_token"

echo "=========================================="
echo "微信云托管部署验证"
echo "=========================================="
echo ""

# 1. 测试回调接口是否可访问
echo "1️⃣  测试回调接口可访问性..."
echo "URL: $DOMAIN/api/wechat/callback"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$DOMAIN/api/wechat/callback?signature=test&timestamp=1234567890&nonce=test&echostr=hello")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ 接口可访问 (HTTP 200)"
  if [ "$BODY" = "Invalid signature" ]; then
    echo "✅ 签名验证逻辑正常"
  else
    echo "⚠️  返回内容: $BODY"
  fi
else
  echo "❌ 接口访问失败 (HTTP $HTTP_CODE)"
  echo "响应: $BODY"
  exit 1
fi

echo ""

# 2. 测试正确签名
echo "2️⃣  测试签名验证..."
TIMESTAMP="1234567890"
NONCE="test_nonce"
ECHOSTR="hello_world_test"

# 计算签名 (使用 Node.js)
SIGNATURE=$(node -e "
const crypto = require('crypto');
const arr = ['$TOKEN', '$TIMESTAMP', '$NONCE'].sort();
const str = arr.join('');
const sha1 = crypto.createHash('sha1').update(str).digest('hex');
console.log(sha1);
")

echo "计算的签名: $SIGNATURE"

RESPONSE=$(curl -s "$DOMAIN/api/wechat/callback?signature=$SIGNATURE&timestamp=$TIMESTAMP&nonce=$NONCE&echostr=$ECHOSTR")

if [ "$RESPONSE" = "$ECHOSTR" ]; then
  echo "✅ 签名验证通过，返回原样 echostr"
else
  echo "❌ 签名验证失败"
  echo "预期: $ECHOSTR"
  echo "实际: $RESPONSE"
  exit 1
fi

echo ""

# 3. 测试混合报告接口
echo "3️⃣  测试混合报告接口..."
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$DOMAIN/api/reports/mixed")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ 混合报告接口正常 (HTTP 200)"
  # 提取报告数量
  REPORT_COUNT=$(echo "$RESPONSE" | grep -v "HTTP_CODE:" | grep -o '"total":[0-9]*' | cut -d: -f2)
  if [ ! -z "$REPORT_COUNT" ]; then
    echo "   报告总数: $REPORT_COUNT"
  fi
else
  echo "❌ 混合报告接口失败 (HTTP $HTTP_CODE)"
  exit 1
fi

echo ""

# 4. 总结
echo "=========================================="
echo "✅ 所有验证通过！"
echo "=========================================="
echo ""
echo "下一步操作："
echo "1. 在微信公众号后台配置服务器"
echo "   URL: $DOMAIN/api/wechat/callback"
echo "   Token: $TOKEN"
echo "   EncodingAESKey: 点击'随机生成'"
echo "   消息加解密方式: 明文模式"
echo ""
echo "2. 点击'提交'，微信会发送验证请求"
echo "3. 验证通过后，启用服务器配置"
echo ""
