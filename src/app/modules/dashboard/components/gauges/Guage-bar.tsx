import GaugeComponent from 'react-gauge-component';
import GPUUsageComponent from './gpu-usage-gauge';
import CPUUsageGauge from './cpu-usage-component';
import MemoryUsageGauge from './memory-usage-gauge';
import { useEffect, useState } from 'react';
import { getPcStats } from '@/api/modelClient';


const GaugeBar = () => {
    const [gpuUsage, setGpuUsage] = useState(0);
    const [cpuUsage, setCpuUsage] = useState(0);
    const [memoryUsage, setMemoryUsage] = useState(0);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadStats = async () => {
            try {
            const data = await getPcStats();
            if (!isMounted) return;

            setGpuUsage(data.gpu);
            setCpuUsage(data.cpu);
            setMemoryUsage(data.memory);
            setError(false);
            } catch (err) {
            if (isMounted) setError(true);
            } finally {
            if (isMounted) setLoading(false);
            }
        };

        loadStats(); // run immediately once

        const interval = setInterval(loadStats, 1000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);


    return ( 
        <div className="border-2 bg-background px-2 py-4">
                <div className='w-full flex'>
                    <GPUUsageComponent gpuUsage={gpuUsage}/>
                    <CPUUsageGauge cpuUsage={cpuUsage}/>
                    <MemoryUsageGauge memoryUsage={memoryUsage}/>
                </div>
        </div>
     );
}
 
export default GaugeBar;