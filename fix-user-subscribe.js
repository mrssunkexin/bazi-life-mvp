/**
 * 手动修复用户关注状态
 * 用于在公众号回调未正确配置时，手动同步用户关注状态
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 从环境变量读取配置
const WECHAT_MP_APPID = process.env.WECHAT_MP_APPID || 'wx02b82dfb83f0a4c5';
const WECHAT_MP_SECRET = process.env.WECHAT_MP_SECRET || '43657d98dbda9e6bec9013003a2d5cfd';

/**
 * 获取公众号access_token
 */
async function getAccessToken() {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_MP_APPID}&secret=${WECHAT_MP_SECRET}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.errcode) {
    throw new Error(`获取access_token失败: [${data.errcode}] ${data.errmsg}`);
  }

  console.log('✅ 获取access_token成功');
  return data.access_token;
}

/**
 * 获取公众号用户信息（通过unionid）
 */
async function getUserInfoByUnionId(accessToken, unionid) {
  // 微信API不支持直接通过unionid查询，需要通过openid
  // 这里我们需要让用户提供公众号openid
  console.log('⚠️ 微信API不支持直接通过unionid获取用户信息');
  console.log('   需要公众号openid才能查询');
  return null;
}

/**
 * 获取用户信息（通过公众号openid）
 */
async function getUserInfo(accessToken, mpOpenid) {
  const url = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${accessToken}&openid=${mpOpenid}&lang=zh_CN`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.errcode) {
    throw new Error(`获取用户信息失败: [${data.errcode}] ${data.errmsg}`);
  }

  return data;
}

/**
 * 手动设置用户关注状态
 */
async function manuallySetSubscribe(userId, mpOpenid) {
  console.log('');
  console.log('🔧 手动设置用户关注状态...');
  console.log(`   userId: ${userId}`);
  console.log(`   mpOpenid: ${mpOpenid}`);

  try {
    // 1. 查询用户
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.log('❌ 用户不存在');
      return false;
    }

    console.log('✅ 找到用户:', user.openid);

    // 2. 获取access_token
    const accessToken = await getAccessToken();

    // 3. 获取公众号用户信息验证
    console.log('');
    console.log('🔍 验证公众号用户信息...');
    const userInfo = await getUserInfo(accessToken, mpOpenid);

    console.log('✅ 公众号用户信息:');
    console.log('   openid:', userInfo.openid);
    console.log('   unionid:', userInfo.unionid);
    console.log('   subscribe:', userInfo.subscribe);
    console.log('   nickname:', userInfo.nickname);

    // 4. 验证unionid是否匹配
    if (userInfo.unionid !== user.unionid) {
      console.log('');
      console.log('❌ unionid不匹配！');
      console.log('   数据库unionid:', user.unionid);
      console.log('   公众号unionid:', userInfo.unionid);
      return false;
    }

    // 5. 更新数据库
    console.log('');
    console.log('💾 更新数据库...');
    await prisma.user.update({
      where: { id: userId },
      data: {
        mpOpenid: mpOpenid,
        subscribeStatus: userInfo.subscribe === 1
      }
    });

    console.log('✅ 更新成功！');
    console.log(`   mpOpenid: ${mpOpenid}`);
    console.log(`   subscribeStatus: ${userInfo.subscribe === 1}`);

    return true;
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    return false;
  }
}

/**
 * 诊断用户状态
 */
async function diagnoseUser(userId) {
  console.log('');
  console.log('=' .repeat(60));
  console.log('🔍 诊断用户状态');
  console.log('=' .repeat(60));
  console.log('');

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        reports: { take: 3, orderBy: { createdAt: 'desc' } },
        fortune2026Reports: { take: 3, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!user) {
      console.log('❌ 用户不存在');
      return;
    }

    console.log('👤 用户信息:');
    console.log('   ID:', user.id);
    console.log('   小程序openid:', user.openid);
    console.log('   unionid:', user.unionid || '❌ 无');
    console.log('   公众号openid:', user.mpOpenid || '❌ 无');
    console.log('   关注状态:', user.subscribeStatus ? '✅ 已关注' : '❌ 未关注');
    console.log('   nickname:', user.nickname || '未授权');
    console.log('');

    console.log('📊 报告统计:');
    console.log('   基础报告:', user.reports.length);
    console.log('   2026报告:', user.fortune2026Reports.length);
    console.log('');

    console.log('🔍 推送能力检查:');
    const hasUnionid = !!user.unionid;
    const hasMpOpenid = !!user.mpOpenid;
    const isSubscribed = !!user.subscribeStatus;

    console.log('   ✓ 有unionid:', hasUnionid ? '✅' : '❌');
    console.log('   ✓ 有mpOpenid:', hasMpOpenid ? '✅' : '❌');
    console.log('   ✓ 已关注公众号:', isSubscribed ? '✅' : '❌');
    console.log('');

    const canPush = hasMpOpenid && isSubscribed;
    console.log('📢 能否接收推送:', canPush ? '✅ 可以' : '❌ 不可以');
    console.log('');

    if (!canPush) {
      console.log('💡 解决方案:');
      if (!hasUnionid) {
        console.log('   1. 用户需要重新登录小程序，获取unionid');
      }
      if (!hasMpOpenid) {
        console.log('   2. 需要配置公众号回调接口，或手动设置mpOpenid');
        console.log('      使用命令: node fix-user-subscribe.js set <userId> <mpOpenid>');
      }
      if (!isSubscribed) {
        console.log('   3. 用户需要关注公众号');
      }
    }

  } catch (error) {
    console.error('❌ 诊断失败:', error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log('');
    console.log('📖 使用说明:');
    console.log('');
    console.log('  # 诊断用户状态');
    console.log('  node fix-user-subscribe.js diagnose <userId>');
    console.log('');
    console.log('  # 手动设置用户关注状态（需要公众号openid）');
    console.log('  node fix-user-subscribe.js set <userId> <mpOpenid>');
    console.log('');
    console.log('示例:');
    console.log('  node fix-user-subscribe.js diagnose cmj2r7h7d00009k5asoviya6d');
    console.log('  node fix-user-subscribe.js set cmj2r7h7d00009k5asoviya6d oXXXXXXXXXXXXXXXX');
    console.log('');
    process.exit(0);
  }

  if (command === 'diagnose') {
    const userId = args[1];
    if (!userId) {
      console.log('❌ 请提供userId');
      process.exit(1);
    }
    await diagnoseUser(userId);
  } else if (command === 'set') {
    const userId = args[1];
    const mpOpenid = args[2];
    if (!userId || !mpOpenid) {
      console.log('❌ 请提供userId和mpOpenid');
      process.exit(1);
    }
    await manuallySetSubscribe(userId, mpOpenid);
  } else {
    console.log('❌ 未知命令:', command);
    console.log('支持的命令: diagnose, set');
    process.exit(1);
  }

  await prisma.$disconnect();
}

main().catch(error => {
  console.error('❌ 程序错误:', error);
  prisma.$disconnect();
  process.exit(1);
});
