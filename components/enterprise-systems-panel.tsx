'use client';

import { useAGIOptimization } from '@/lib/agi-performance-optimizer';
import { useDecentralizedEncryption } from '@/lib/decentralized-encryption';
import { useSelfHealingError } from '@/lib/self-healing-error-handler';
import { useTelemetryDashboard } from '@/lib/global-telemetry-dashboard';
import { compatibilityMatrix } from '@/lib/web3-sdk-compatibility-matrix';
import { useState, useEffect } from 'react';

/**
 * Enterprise Integration Panel
 * Demonstrates all advanced systems working together
 */
export function EnterpriseSystemsPanel() {
  const { profile: optimizationProfile, metrics: performanceMetrics } = useAGIOptimization();
  const encryptionManager = useDecentralizedEncryption();
  const errorHandler = useSelfHealingError();
  const { dashboard, metrics: telemetryMetrics } = useTelemetryDashboard();

  const [activeTab, setActiveTab] = useState<'performance' | 'encryption' | 'health' | 'telemetry' | 'compatibility'>('performance');
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    setAlerts(dashboard.detectAnomalies());
  }, [telemetryMetrics, dashboard]);

  return (
    <div className="space-y-6 p-6 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Enterprise Systems Dashboard</h2>
        <div className="flex gap-2">
          {alerts.length > 0 && (
            <div className="px-3 py-1 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm">
              {alerts.length} Alert{alerts.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700">
        {(
          [
            'performance',
            'encryption',
            'health',
            'telemetry',
            'compatibility',
          ] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">AGI Performance Optimization</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded border border-slate-700">
              <p className="text-slate-400 text-sm">Quality Level</p>
              <p className="text-white font-semibold capitalize">{optimizationProfile.qualityLevel}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded border border-slate-700">
              <p className="text-slate-400 text-sm">Texture Resolution</p>
              <p className="text-white font-semibold">{optimizationProfile.textureResolution}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded border border-slate-700">
              <p className="text-slate-400 text-sm">FPS</p>
              <p className="text-white font-semibold">{performanceMetrics.fps}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded border border-slate-700">
              <p className="text-slate-400 text-sm">Memory Usage</p>
              <p className="text-white font-semibold">{performanceMetrics.memoryUsage.toFixed(1)}%</p>
            </div>
          </div>
          <div className="bg-slate-800 p-4 rounded border border-slate-700">
            <p className="text-slate-400 text-sm mb-2">Cache Strategy</p>
            <p className="text-white capitalize">{optimizationProfile.cacheStrategy}</p>
          </div>
          {performanceMetrics.bottlenecks.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500 p-4 rounded">
              <p className="text-yellow-200 font-semibold mb-2">Detected Bottlenecks:</p>
              <ul className="text-yellow-100 text-sm space-y-1">
                {performanceMetrics.bottlenecks.map((bn, i) => (
                  <li key={i}>• {bn}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Encryption Tab */}
      {activeTab === 'encryption' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Decentralized Encryption</h3>
          <div className="bg-slate-800 p-4 rounded border border-slate-700 space-y-2">
            <p className="text-slate-400 text-sm">Public Key</p>
            <p className="text-white font-mono text-xs break-all">
              {encryptionManager.getPublicKey().slice(0, 50)}...
            </p>
          </div>
          <div className="bg-green-500/10 border border-green-500 p-4 rounded">
            <p className="text-green-200">✓ Client-side encryption enabled</p>
            <p className="text-green-100 text-sm mt-1">All assets protected with NaCl secretbox</p>
          </div>
        </div>
      )}

      {/* Health Tab */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Self-Healing Error Handler</h3>
          <div className="space-y-2">
            {Array.from(errorHandler.getHealthDashboard().entries()).map(([service, state]) => (
              <div
                key={service}
                className={`p-3 rounded border ${
                  state.status === 'healthy'
                    ? 'bg-green-500/10 border-green-500'
                    : state.status === 'degraded'
                    ? 'bg-yellow-500/10 border-yellow-500'
                    : 'bg-red-500/10 border-red-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white capitalize">{service}</span>
                  <span
                    className={`text-xs font-semibold capitalize ${
                      state.status === 'healthy'
                        ? 'text-green-200'
                        : state.status === 'degraded'
                        ? 'text-yellow-200'
                        : 'text-red-200'
                    }`}
                  >
                    {state.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Success: {state.successCount} | Failed: {state.failureCount} | Avg Latency:{' '}
                  {state.avgResponseTime.toFixed(0)}ms
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Telemetry Tab */}
      {activeTab === 'telemetry' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Global Telemetry</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded border border-slate-700">
              <p className="text-slate-400 text-sm">Transactions</p>
              <p className="text-white font-semibold text-lg">{telemetryMetrics.totalTransactions}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded border border-slate-700">
              <p className="text-slate-400 text-sm">Success Rate</p>
              <p className="text-white font-semibold text-lg">
                {telemetryMetrics.successRate.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="bg-slate-800 p-4 rounded border border-slate-700">
            <p className="text-slate-400 text-sm mb-3">Revenue Split (50-30-10-10)</p>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm text-slate-300 mb-1">
                  <span>User (50%)</span>
                  <span>{telemetryMetrics.revenueDistributed.user.toFixed(2)} Pi</span>
                </div>
                <div className="bg-slate-700 h-2 rounded">
                  <div
                    className="h-full bg-blue-500 rounded"
                    style={{ width: '50%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-slate-300 mb-1">
                  <span>Community (30%)</span>
                  <span>{telemetryMetrics.revenueDistributed.community.toFixed(2)} Pi</span>
                </div>
                <div className="bg-slate-700 h-2 rounded">
                  <div
                    className="h-full bg-green-500 rounded"
                    style={{ width: '30%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-slate-300 mb-1">
                  <span>Developer (10%)</span>
                  <span>{telemetryMetrics.revenueDistributed.developer.toFixed(2)} Pi</span>
                </div>
                <div className="bg-slate-700 h-2 rounded">
                  <div
                    className="h-full bg-purple-500 rounded"
                    style={{ width: '10%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-slate-300 mb-1">
                  <span>Server (10%)</span>
                  <span>{telemetryMetrics.revenueDistributed.server.toFixed(2)} Pi</span>
                </div>
                <div className="bg-slate-700 h-2 rounded">
                  <div
                    className="h-full bg-orange-500 rounded"
                    style={{ width: '10%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compatibility Tab */}
      {activeTab === 'compatibility' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Web3 SDK Compatibility Matrix</h3>
          <div className="grid grid-cols-1 gap-3">
            {Array.from(compatibilityMatrix.getAllProfiles().entries()).map(
              ([platform, profile]) => (
                <div key={platform} className="bg-slate-800 p-3 rounded border border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white capitalize">{platform}</span>
                    <div className="text-right text-xs text-slate-400">
                      <div>Poly: {profile.maxPolyCount.toLocaleString()}</div>
                      <div>Bones: {profile.maxBoneCount}</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Formats: {profile.supportedFormats.join(', ')}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500 p-4 rounded">
          <p className="text-red-200 font-semibold mb-2">System Alerts:</p>
          <ul className="text-red-100 text-sm space-y-1">
            {alerts.map((alert, i) => (
              <li key={i}>{alert}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
