'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Voucher {
  id: string;
  code: string;
  isUsed: boolean;
  createdAt: string;
  usedAt: string | null;
  report: {
    id: string;
    name: string;
    createdAt: string;
  } | null;
}

export default function VouchersPage() {
  const router = useRouter();
  const [allVouchers, setAllVouchers] = useState<Voucher[]>([]); // 存储全部数据用于统计
  const [vouchers, setVouchers] = useState<Voucher[]>([]); // 显示的数据(筛选后)
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [count, setCount] = useState<number>(10);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unused' | 'used'>('all');

  // 加载兑换码列表
  const loadVouchers = async () => {
    try {
      setLoading(true);

      // 1. 总是先加载全部数据用于统计
      const allRes = await fetch('/api/admin/vouchers');
      const allData = await allRes.json();
      if (allData.success) {
        setAllVouchers(allData.data);
      }

      // 2. 根据筛选条件加载显示的数据
      const url = filterStatus === 'all'
        ? '/api/admin/vouchers'
        : `/api/admin/vouchers?status=${filterStatus}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setVouchers(data.data);
      } else {
        alert('加载失败: ' + data.error);
      }
    } catch (error) {
      console.error('加载兑换码失败:', error);
      alert('加载失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, [filterStatus]);

  // 生成兑换码
  const handleGenerate = async () => {
    if (count < 1 || count > 1000) {
      alert('生成数量必须在 1-1000 之间');
      return;
    }

    if (!confirm(`确认生成 ${count} 个兑换码？`)) {
      return;
    }

    try {
      setGenerating(true);
      const res = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`成功生成 ${data.data.length} 个兑换码`);
        loadVouchers();
      } else {
        alert('生成失败: ' + data.error);
      }
    } catch (error) {
      console.error('生成兑换码失败:', error);
      alert('生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  // 复制兑换码
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('已复制: ' + code);
  };

  // 统计信息 - 始终基于全部数据
  const totalCount = allVouchers.length;
  const usedCount = allVouchers.filter(v => v.isUsed).length;
  const unusedCount = totalCount - usedCount;

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>兑换码管理</h1>
        <button
          onClick={() => router.push('/admin')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          返回报告列表
        </button>
      </div>

      {/* 生成兑换码表单 */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f7fafc',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>生成兑换码</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 0)}
            placeholder="数量（如 50）"
            style={{
              padding: '10px',
              border: '1px solid #cbd5e0',
              borderRadius: '5px',
              width: '150px',
            }}
          />
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              padding: '10px 30px',
              backgroundColor: generating ? '#a0aec0' : '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: generating ? 'not-allowed' : 'pointer',
            }}
          >
            {generating ? '生成中...' : '生成'}
          </button>
        </div>
      </div>

      {/* 统计信息 - 可点击切换筛选 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '15px',
        marginBottom: '20px',
      }}>
        <button
          onClick={() => setFilterStatus('all')}
          style={{
            padding: '15px',
            backgroundColor: '#e6fffa',
            borderRadius: '8px',
            border: filterStatus === 'all' ? '3px solid #2c7a7b' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '14px', color: '#2c7a7b' }}>总数</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c7a7b' }}>{totalCount}</div>
        </button>
        <button
          onClick={() => setFilterStatus('unused')}
          style={{
            padding: '15px',
            backgroundColor: '#fef5e7',
            borderRadius: '8px',
            border: filterStatus === 'unused' ? '3px solid #975a16' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '14px', color: '#975a16' }}>未使用</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#975a16' }}>{unusedCount}</div>
        </button>
        <button
          onClick={() => setFilterStatus('used')}
          style={{
            padding: '15px',
            backgroundColor: '#e8f4fd',
            borderRadius: '8px',
            border: filterStatus === 'used' ? '3px solid #2c5282' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '14px', color: '#2c5282' }}>已使用</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c5282' }}>{usedCount}</div>
        </button>
      </div>

      {/* 兑换码列表 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
          加载中...
        </div>
      ) : vouchers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
          暂无兑换码
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f7fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>兑换码</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>状态</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>使用者</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>使用时间</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>创建时间</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((voucher) => (
                <tr key={voucher.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '14px' }}>
                    {voucher.code}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {voucher.isUsed ? (
                      <span style={{
                        padding: '4px 12px',
                        backgroundColor: '#bee3f8',
                        color: '#2c5282',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}>
                        已使用
                      </span>
                    ) : (
                      <span style={{
                        padding: '4px 12px',
                        backgroundColor: '#c6f6d5',
                        color: '#22543d',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}>
                        未使用
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', color: '#4a5568' }}>
                    {voucher.report ? voucher.report.name : '-'}
                  </td>
                  <td style={{ padding: '12px', color: '#718096', fontSize: '14px' }}>
                    {voucher.usedAt ? new Date(voucher.usedAt).toLocaleString('zh-CN') : '-'}
                  </td>
                  <td style={{ padding: '12px', color: '#718096', fontSize: '14px' }}>
                    {new Date(voucher.createdAt).toLocaleString('zh-CN')}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleCopy(voucher.code)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#edf2f7',
                        color: '#2d3748',
                        border: '1px solid #cbd5e0',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      复制
                    </button>
                    {voucher.report && (
                      <button
                        onClick={() => router.push(`/admin/reports/${voucher.report!.id}`)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#edf2f7',
                          color: '#2d3748',
                          border: '1px solid #cbd5e0',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          marginLeft: '5px',
                        }}
                      >
                        查看报告
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
