import { useState } from "react";
import { BackspaceIcon, ShieldIcon, CloseIcon } from "../../utils/icons";

export function PinScreen({ onSuccess }) {
    const [pin, setPin] = useState('');
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [shaking, setShaking] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false);

    const defaultPin = process.env.REACT_APP_DEFAULT_PIN || '123456';
    const masterPasscode = process.env.REACT_APP_MASTER_PASSCODE;

    const shakeAndClear = (setter) => {
        setShaking(true);
        setTimeout(() => {
            setter('');
            setShaking(false);
        }, 500);
    };

    const checkPin = (currentPin) => {
        const storedPin = JSON.parse(localStorage.getItem('moneyplus_pin')) || defaultPin;
        if (currentPin === storedPin) {
            onSuccess();
        } else {
            setError('PIN Salah');
            shakeAndClear(setPin);
        }
    };

    const checkMasterPasscode = () => {
        if (!masterPasscode) {
            setError('Fitur reset tidak dikonfigurasi.');
            shakeAndClear(setPasscode);
            return;
        }
        if (passcode === masterPasscode) {
            localStorage.setItem('moneyplus_pin', defaultPin);
            setMessage('PIN berhasil direset ke default.');
            setPasscode('');
            setIsResetMode(false);
        } else {
            setError('Passcode salah');
            shakeAndClear(setPasscode);
        }
    };

    const handleKeyPress = (key) => {
        setError('');
        setMessage('');
        if (pin.length < 6) {
            const newPin = pin + key;
            setPin(newPin);
            if (newPin.length === 6) {
                checkPin(newPin);
            }
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const toggleResetMode = () => {
        setIsResetMode(!isResetMode);
        setError('');
        setMessage('');
        setPin('');
        setPasscode('');
    }

    // Fungsi untuk handle submit form passcode
    const handlePasscodeSubmit = (e) => {
        e.preventDefault();
        checkMasterPasscode();
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
            <div className="text-center">
                <ShieldIcon/>
                <h2 className="text-2xl font-bold mt-4">
                    {isResetMode ? 'Masukkan Master Passcode' : 'Masukkan PIN Anda'}
                </h2>
            </div>

            {/* Tampilan kondisional: PIN atau Passcode */}
            {isResetMode ? (
                <div className="w-full max-w-xs mt-8">
                    <form onSubmit={handlePasscodeSubmit}>
                        <input
                            type="password"
                            value={passcode}
                            onChange={(e) => {
                                setPasscode(e.target.value);
                                setError('');
                                setMessage('');
                            }}
                            className={`w-full px-4 py-3 text-center tracking-widest bg-white border-2 rounded-lg text-lg ${error ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Passcode Rahasia"
                            autoFocus
                        />
                        <button type="submit" className="w-full mt-4 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
                            Verifikasi Passcode
                        </button>
                    </form>
                </div>
            ) : (
                <div className={`flex space-x-4 my-8 ${shaking ? 'shake' : ''}`}>
                    {Array.from({length: 6}).map((_, i) => (
                        <div key={i}
                             className={`w-6 h-6 rounded-full border-2 ${error ? 'border-red-500' : 'border-gray-400'} ${pin.length > i ? 'bg-blue-500 border-blue-500' : 'bg-transparent'}`}></div>
                    ))}
                </div>
            )}


            {error && <p className="text-red-500 h-6 mt-2">{error}</p>}
            {message && <p className="text-green-600 h-6 mt-2">{message}</p>}

            {/* Tampilkan Keypad hanya jika tidak dalam mode reset */}
            {!isResetMode ? (
                <div className="grid grid-cols-3 gap-6 mt-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button key={num} onClick={() => handleKeyPress(num)}
                                className="w-20 h-20 rounded-full bg-white text-2xl font-semibold shadow-md active:bg-gray-200">
                            {num}
                        </button>
                    ))}

                    <button onClick={toggleResetMode}
                            className="w-20 h-20 text-blue-600 font-semibold text-sm">
                        Lupa PIN?
                    </button>

                    <button onClick={() => handleKeyPress(0)}
                            className="w-20 h-20 rounded-full bg-white text-2xl font-semibold shadow-md active:bg-gray-200">
                        0
                    </button>
                    <button onClick={handleDelete}
                            className="w-20 h-20 flex items-center justify-center text-gray-600">
                        <BackspaceIcon/>
                    </button>
                </div>
            ) : (
                // Tombol Batal di mode reset
                <div className="mt-6">
                    <button onClick={toggleResetMode}
                            className="text-gray-500 font-semibold text-sm hover:text-gray-700">
                        Batal
                    </button>
                </div>
            )}
        </div>
    );
}