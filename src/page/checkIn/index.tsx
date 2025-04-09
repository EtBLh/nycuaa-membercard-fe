import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
import { useState } from 'react';

const Page = () => {

    const [currentCode, setCurrentCode] = useState<string>('');

    const onScan = (result: IDetectedBarcode[]) => {
        console.log('scanned',result)
        setCurrentCode(result[0].rawValue)
    }
    
    return <main className='w-screen h-screen flex'>
        <section className='flex items-center justify-center'>
            <div className='w-2/3 p-[36px]'>
                <Scanner
                    onScan={onScan}
                    components={{
                        onOff: true
                    }}
                    styles={{
                        container: {
                            border: 'none',
                            background: 'transparent'
                        },
                        video: {
                            border: 'none',
                            borderRadius: '1rem'
                        },
                        finderBorder: 100
                    }}
                    paused={true}
                />
            </div>
        </section>
        <section className='flex items-center justify-center'>
            {currentCode}
        </section>
    </main>
}

export default Page;