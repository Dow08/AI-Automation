import { NextResponse } from 'next/server';
import si from 'systeminformation';

function formatBytesVal(b: number): number {
  return Math.round(b);
}

export async function GET() {
  try {
    const [cpuLoad, mem, graphics, netStats] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.graphics(),
      si.networkStats('*'),
    ]);

    // Aggregate network across all interfaces (exclude loopback)
    const netFiltered = Array.isArray(netStats) ? netStats : [netStats];
    const rx_sec = netFiltered.reduce((a, n) => a + Math.max(0, n.rx_sec ?? 0), 0);
    const tx_sec = netFiltered.reduce((a, n) => a + Math.max(0, n.tx_sec ?? 0), 0);

    // First discrete GPU (prefer NVIDIA/AMD over Intel integrated)
    const controllers = graphics.controllers ?? [];
    const gpu =
      controllers.find(g => /nvidia|amd|radeon/i.test(g.vendor ?? g.model ?? '')) ??
      controllers[0] ??
      null;

    return NextResponse.json({
      cpu: {
        load: Math.round(cpuLoad.currentLoad),
      },
      ram: {
        used:    formatBytesVal(mem.active || mem.used),
        total:   formatBytesVal(mem.total),
        percent: Math.round(((mem.active || mem.used) / mem.total) * 100),
      },
      gpu: gpu ? {
        name:           gpu.model ?? 'GPU',
        utilizationGpu: gpu.utilizationGpu ?? null,
        memUsed:        gpu.memoryUsed  ?? null,  // MB
        memTotal:       gpu.memoryTotal ?? null,  // MB
      } : null,
      network: {
        rx_sec: Math.round(rx_sec),
        tx_sec: Math.round(tx_sec),
      },
    }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
