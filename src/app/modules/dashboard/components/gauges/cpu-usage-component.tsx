import GaugeComponent from 'react-gauge-component';

interface cpuUsageComponentInterface {
    cpuUsage: number
}

const CPUUsageComponent = ({cpuUsage}: cpuUsageComponentInterface) => {
    return ( 
        <div className='border-2 border-white w-full flex flex-col justify-center items-center'>
            <GaugeComponent 
                type='semicircle'
                marginInPercent= {{ top: .05, bottom: .05, left: .05, right: .05 }}
                value={ cpuUsage }
                labels={{
                    valueLabel: {
                        hide: true,
                    },
                    tickLabels: {
                        hideMinMax: true,
                    }
                }}
                className='w-[140px] h-[75px] border-2 border-green'
            />
            <p>
                CPU
            </p>
        </div>
     );
}

export default CPUUsageComponent;