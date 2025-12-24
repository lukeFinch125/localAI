import GaugeComponent from "react-gauge-component";

const MemoryUsageGauge = () => {
    return ( 
        <div className='border-2 border-white w-full flex flex-col justify-center items-center'>
            <GaugeComponent 
                type='semicircle'
                marginInPercent= {{ top: .05, bottom: .05, left: .05, right: .05 }}
                value={ 50 }
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
                Memory
            </p>
        </div>
     );
}
 
export default MemoryUsageGauge;