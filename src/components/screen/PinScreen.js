import {useEffect, useState} from "react";
import {BackspaceIcon, ShieldIcon} from "../../utils/icons";

export function PinScreen({onSuccess}) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [shaking, setShaking] = useState(false);
    const storedPin = localStorage.getItem('moneyplus_pin') || '123456';

    const handleKeyPress = (key) => {
        if (pin.length < 6) {
            setPin(pin + key);
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    useEffect(() => {
        if (pin.length === 6) {
            if (pin === storedPin) {
                onSuccess();
            } else {
                setError('PIN salah, silakan coba lagi.');
                setShaking(true);
                setTimeout(() => {
                    setPin('');
                    setShaking(false);
                }, 500);
            }
        } else {
            setError('');
        }
    }, [pin, storedPin, onSuccess]);

    const PinKeyButton = ({children, onClick, className = ""}) => (
        <button onClick={onClick}
                className={`bg-white/20 backdrop-blur-sm h-16 w-16 flex justify-center items-center text-2xl font-semibold text-white active:bg-white/40 transition-colors rounded-full ${className}`}>
            {children}
        </button>
    );

    return (
        <div
            className="fixed inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col justify-center items-center p-4">
            <div className="text-center text-white mb-8">
                <ShieldIcon/>
                <h1 className="text-2xl font-bold mt-2">Masukkan PIN</h1>
            </div>
            <div className={`flex space-x-4 mb-4 ${shaking ? 'shake' : ''}`}>
                {[...Array(6)].map((_, i) => (
                    <div key={i}
                         className={`w-4 h-4 rounded-full border-2 border-white ${pin.length > i ? 'bg-white' : ''}`}></div>
                ))}
            </div>
            {error && <p className="text-red-300 mb-4">{error}</p>}
            <div className="grid grid-cols-3 gap-6">
                {[...Array(9).keys()].map(i => <PinKeyButton key={i + 1}
                                                             onClick={() => handleKeyPress((i + 1).toString())}>{i + 1}</PinKeyButton>)}
                <div/>
                <PinKeyButton onClick={() => handleKeyPress('0')}>0</PinKeyButton>
                <PinKeyButton onClick={handleDelete}><BackspaceIcon/></PinKeyButton>
            </div>
        </div>
    );
}