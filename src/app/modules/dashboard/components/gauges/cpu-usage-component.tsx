import GaugeComponent from 'react-gauge-component';

interface cpuUsageComponentInterface {
    cpuUsage: number
}

const CPUUsageComponent = ({cpuUsage}: cpuUsageComponentInterface) => {
    return ( 
        <div className='w-full flex flex-col justify-center items-center'>
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
                className='w-[100px] h-[50px]'
            />
            <p>
                CPU
            </p>
        </div>
     );
}

export default CPUUsageComponent;