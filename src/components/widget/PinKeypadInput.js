import React, { useState } from 'react';
import { BackspaceIcon } from '../../utils/icons';

export function PinKeypadInput({ title, pinLength = 6, onPinComplete, onCancel, cancelText }) {
    const [pin, setPin] = useState('');
    const [shaking, setShaking] = useState(false);

    const handleKeyPress = (key) => {
        if (pin.length < pinLength) {
            const newPin = pin + key;
            setPin(newPin);
            if (newPin.length === pinLength) {
                onPinComplete(newPin);
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    // Fungsi ini bisa dipanggil dari parent untuk menampilkan error
    PinKeypadInput.shake = () => {
        setShaking(true);
        setTimeout(() => {
            setPin('');
            setShaking(false);
        }, 500);
    };

    return (
        <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">{title}</h3>
            <div className={`flex space-x-4 mb-8 ${shaking ? 'shake' : ''}`}>
                {Array.from({ length: pinLength }).map((_, i) => (
                    <div key={i}
                         className={`w-5 h-5 rounded-full border-2 border-gray-400 ${pin.length > i ? 'bg-blue-500 border-blue-500' : 'bg-transparent'}`}></div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button key={num} onClick={() => handleKeyPress(num)}
                            className="w-16 h-16 rounded-full bg-white text-xl font-semibold shadow-md active:bg-gray-200">
                        {num}
                    </button>
                ))}

                <div className="w-16 h-16 flex items-center justify-center">
                    {onCancel && (
                        <button onClick={onCancel} className="text-blue-600 font-semibold text-sm">{cancelText}</button>
                    )}
                </div>

                <button onClick={() => handleKeyPress(0)}
                        className="w-16 h-16 rounded-full bg-white text-xl font-semibold shadow-md active:bg-gray-200">
                    0
                </button>
                <button onClick={handleDelete}
                        className="w-16 h-16 flex items-center justify-center text-gray-600">
                    <BackspaceIcon/>
                </button>
            </div>
        </div>
    );
}