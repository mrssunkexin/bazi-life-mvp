import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

// GET - 获取小程序配置（公开接口）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keys = searchParams.get('keys'); // 逗号分隔的key列表

    let configs;
    if (keys) {
      // 获取指定的配置项
      const keyList = keys.split(',');
      configs = await prisma.configuration.findMany({
        where: {
          key: {
            in: keyList
          }
        }
      });
    } else {
      // 获取所有配置（仅返回key-value）
      configs = await prisma.configuration.findMany();
    }

    // 转换为键值对对象
    const configMap: Record<string, any> = {};
    configs.forEach(config => {
      // 根据类型解析value
      if (config.type === 'boolean') {
        configMap[config.key] = config.value === 'true';
      } else if (config.type === 'number') {
        configMap[config.key] = parseFloat(config.value);
      } else if (config.type === 'json') {
        try {
          configMap[config.key] = JSON.parse(config.value);
        } catch {
          configMap[config.key] = config.value;
        }
      } else {
        configMap[config.key] = config.value;
      }
    });

    const latestUpdatedAt = configs.reduce<Date | null>((latest, config) => {
      if (!latest || config.updatedAt > latest) {
        return config.updatedAt;
      }
      return latest;
    }, null);
    configMap.__config_version = latestUpdatedAt ? latestUpdatedAt.toISOString() : '0';

    const response = successResponse(configMap);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error: any) {
    console.error('❌ 获取配置失败:', error);
    return errorResponse(error.message || '获取配置失败', ErrorCodes.SERVER_ERROR, 500);
  }
}
