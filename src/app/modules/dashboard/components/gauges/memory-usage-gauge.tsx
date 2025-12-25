import GaugeComponent from "react-gauge-component";

interface memoryUsageGaugeInterface {
    memoryUsage: number
}

const MemoryUsageGauge = ({ memoryUsage }: memoryUsageGaugeInterface) => {
    return ( 
        <div className='w-full flex flex-col justify-center items-center'>
            <GaugeComponent 
                type='semicircle'
                marginInPercent= {{ top: .05, bottom: .05, left: .05, right: .05 }}
                value={ memoryUsage }
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
                Memory
            </p>
        </div>
     );
}
 
export default MemoryUsageGauge;