import GaugeComponent from 'react-gauge-component';

interface gpuUsageComponentInterface {
    gpuUsage: number
}

const GPUUsageComponent = ({gpuUsage}: gpuUsageComponentInterface) => {
    return ( 
        <div className='w-full flex flex-col justify-center items-center'>
            <GaugeComponent 
                type='semicircle'
                marginInPercent= {{ top: .05, bottom: .05, left: .05, right: .05 }}
                value={ gpuUsage }
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
                GPU
            </p>
        </div>
     );
}

export default GPUUsageComponent;