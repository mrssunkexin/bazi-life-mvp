'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Config {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'boolean' | 'number' | 'json';
  label: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ConfigPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 编辑表单状态
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    type: 'text' as 'text' | 'boolean' | 'number' | 'json',
    label: '',
    description: ''
  });

  // 加载配置列表
  const loadConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/config');
      const data = await res.json();

      if (data.success) {
        setConfigs(data.data);
      } else {
        alert('加载失败: ' + data.error);
      }
    } catch (error) {
      console.error('加载配置失败:', error);
      alert('加载失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  // 保存配置
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.key || !formData.label) {
      alert('请填写配置标识和显示名称');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        alert(editingKey ? '配置已更新' : '配置已创建');
        setEditingKey(null);
    setFormData({
      key: '',
      value: 'true', // 默认布尔值为 true，避免空值导致校验失败
      type: 'text',
      label: '',
      description: ''
    });
    loadConfigs();
      } else {
        alert('保存失败: ' + data.error);
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 编辑配置
  const handleEdit = (config: Config) => {
    setEditingKey(config.key);
    setFormData({
      key: config.key,
      value: config.value,
      type: config.type,
      label: config.label,
      description: config.description || ''
    });
  };

  // 删除配置
  const handleDelete = async (key: string) => {
    if (!confirm(`确认删除配置 "${key}" ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/config?key=${key}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        alert('配置已删除');
        loadConfigs();
      } else {
        alert('删除失败: ' + data.error);
      }
    } catch (error) {
      console.error('删除配置失败:', error);
      alert('删除失败，请重试');
    }
  };

  // 取消编辑
  const handleCancel = () => {
    setEditingKey(null);
    setFormData({
      key: '',
      value: '',
      type: 'text',
      label: '',
      description: ''
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>配置管理</h1>
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
          返回后台
        </button>
      </div>

      {/* 配置表单 */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f7fafc',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
          {editingKey ? '编辑配置' : '新增配置'}
        </h2>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                配置标识 (key) *
              </label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                disabled={!!editingKey}
                placeholder="如: app_title"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #cbd5e0',
                  borderRadius: '5px',
                  backgroundColor: editingKey ? '#e2e8f0' : 'white',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                显示名称 *
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="如: 小程序标题"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #cbd5e0',
                  borderRadius: '5px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                配置类型
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value as any;
                  // 如果切换到布尔类型且当前值为空，默认设为 true 避免必填校验失败
                  const newValue = newType === 'boolean' && formData.value === '' ? 'true' : formData.value;
                  setFormData({ ...formData, type: newType, value: newValue });
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #cbd5e0',
                  borderRadius: '5px',
                }}
              >
                <option value="text">文本</option>
                <option value="boolean">布尔值</option>
                <option value="number">数字</option>
                <option value="json">JSON</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                配置值 *
              </label>
              {formData.type === 'boolean' ? (
                <select
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e0',
                    borderRadius: '5px',
                  }}
                >
                  <option value="true">true (显示)</option>
                  <option value="false">false (隐藏)</option>
                </select>
              ) : formData.key === 'report_generation_mode' ? (
                <select
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e0',
                    borderRadius: '5px',
                  }}
                >
                  <option value="ai_generation">AI解读模式</option>
                  <option value="algorithm_only">纯算法模式</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={formData.type === 'text' ? '如: 生辰五行报告' : '请输入值'}
                  maxLength={formData.type === 'text' ? 20 : undefined}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e0',
                    borderRadius: '5px',
                  }}
                />
              )}
              {formData.type === 'text' && (
                <div style={{ fontSize: '12px', color: '#718096', marginTop: '5px' }}>
                  {formData.value.length}/20 字符
                </div>
              )}
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                说明
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="配置项的说明（可选）"
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #cbd5e0',
                  borderRadius: '5px',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '10px 30px',
                backgroundColor: saving ? '#a0aec0' : '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? '保存中...' : editingKey ? '更新' : '创建'}
            </button>
            {editingKey && (
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '10px 30px',
                  backgroundColor: '#e2e8f0',
                  color: '#2d3748',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 配置列表 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
          加载中...
        </div>
      ) : configs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
          暂无配置项
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
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>配置标识</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>显示名称</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>类型</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>配置值</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>说明</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((config) => (
                <tr key={config.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '14px' }}>
                    {config.key}
                  </td>
                  <td style={{ padding: '12px', color: '#2d3748' }}>
                    {config.label}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: '#e6fffa',
                      color: '#2c7a7b',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}>
                      {config.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#4a5568', maxWidth: '300px', wordBreak: 'break-word' }}>
                    {config.type === 'boolean' ? (
                      config.value === 'true' ? '✓ true (显示)' : '✗ false (隐藏)'
                    ) : (
                      config.value
                    )}
                  </td>
                  <td style={{ padding: '12px', color: '#718096', fontSize: '14px', maxWidth: '200px' }}>
                    {config.description || '-'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEdit(config)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#edf2f7',
                        color: '#2d3748',
                        border: '1px solid #cbd5e0',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        marginRight: '5px',
                      }}
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(config.key)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#fff5f5',
                        color: '#c53030',
                        border: '1px solid #feb2b2',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      删除
                    </button>
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
