import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

// GET - 获取所有配置或单个配置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      // 获取单个配置
      const config = await prisma.configuration.findUnique({
        where: { key }
      });

      if (!config) {
        return errorResponse('配置不存在', ErrorCodes.NOT_FOUND, 404);
      }

      return successResponse(config);
    } else {
      // 获取所有配置
      const configs = await prisma.configuration.findMany({
        orderBy: { createdAt: 'asc' }
      });

      return successResponse(configs);
    }
  } catch (error: any) {
    console.error('❌ 获取配置失败:', error);
    return errorResponse(error.message || '获取配置失败', ErrorCodes.SERVER_ERROR, 500);
  }
}

// POST - 创建或更新配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, type, label, description } = body;

    // 验证必填参数
    if (!key || !value || !type || !label) {
      return errorResponse('参数不完整', ErrorCodes.VALIDATION_ERROR, 400);
    }

    // 检查配置是否已存在
    const existingConfig = await prisma.configuration.findUnique({
      where: { key }
    });

    let config;
    if (existingConfig) {
      // 更新现有配置
      config = await prisma.configuration.update({
        where: { key },
        data: { value, type, label, description }
      });
      console.log(`✅ 配置已更新: ${key}`);
    } else {
      // 创建新配置
      config = await prisma.configuration.create({
        data: { key, value, type, label, description }
      });
      console.log(`✅ 配置已创建: ${key}`);
    }

    return successResponse(config, existingConfig ? 200 : 201);
  } catch (error: any) {
    console.error('❌ 保存配置失败:', error);
    return errorResponse(error.message || '保存配置失败', ErrorCodes.SERVER_ERROR, 500);
  }
}

// DELETE - 删除配置
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return errorResponse('缺少配置key', ErrorCodes.VALIDATION_ERROR, 400);
    }

    await prisma.configuration.delete({
      where: { key }
    });

    console.log(`✅ 配置已删除: ${key}`);
    return successResponse({ message: '配置已删除' });
  } catch (error: any) {
    console.error('❌ 删除配置失败:', error);
    return errorResponse(error.message || '删除配置失败', ErrorCodes.SERVER_ERROR, 500);
  }
}
