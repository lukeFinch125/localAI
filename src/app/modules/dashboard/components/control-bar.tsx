import GaugeComponent from 'react-gauge-component';
import GPUUsageComponent from './gauges/gpu-usage-gauge';
import CPUUsageGauge from './gauges/cpu-usage-component';
import MemoryUsageGauge from './gauges/memory-usage-gauge';


const ControlBar = () => {
    return ( 
        <div className="border-2 bg-background px-2 py-4">
                <div className='w-full flex'>
                    <GPUUsageComponent />
                    <CPUUsageGauge />
                    <MemoryUsageGauge />
                </div>
        </div>
     );
}
 
export default ControlBar;