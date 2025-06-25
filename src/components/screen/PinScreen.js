import {useEffect, useState} from "react";
import {BackspaceIcon, ShieldIcon} from "../../utils/icons";

export function PinScreen({onSuccess}) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // Untuk pesan sukses/loading
    const [isLoading, setIsLoading] = useState(false);
    const [shaking, setShaking] = useState(false);

    const checkPin = (currentPin) => {
        const storedPin = process.env.REACT_APP_DEFAULT_PIN || localStorage.getItem('moneyplus_pin') || '123456';
        if (currentPin === storedPin) {
            onSuccess();
        } else {
            setError('PIN Salah');
            setShaking(true);
            setTimeout(() => {
                setPin('');
                setShaking(false);
            }, 500);
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
        setError('');
        setPin(pin.slice(0, -1));
    };

    const handlePinReset = async () => {
        // eslint-disable-next-line no-restricted-globals
        if (!confirm('Anda yakin ingin mereset PIN? PIN baru akan dikirimkan ke email Anda.')) {
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('Mengirim PIN baru...');
        try {
            // Memanggil endpoint di folder /api
            const response = await fetch('/api/reset-pin', { method: 'POST' });
            if (!response.ok) {
                throw new Error('Server merespon dengan error.');
            }
            const data = await response.json();

            // Simpan PIN baru ke localStorage agar bisa langsung digunakan
            localStorage.setItem('moneyplus_pin', JSON.stringify(data.newPin));

            setMessage('PIN baru telah dikirim ke email Anda. Silakan cek.');
            setPin('');

        } catch (err) {
            console.error(err);
            setError('Gagal mereset PIN. Coba lagi nanti.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="text-center">
                <ShieldIcon/>
                <h2 className="text-2xl font-bold mt-4">Masukkan PIN Anda</h2>
            </div>
            <div className={`flex space-x-4 my-8 ${shaking ? 'shake' : ''}`}>
                {Array.from({length: 6}).map((_, i) => (
                    <div key={i}
                         className={`w-6 h-6 rounded-full border-2 ${error ? 'border-red-500' : 'border-gray-400'} ${pin.length > i ? 'bg-blue-500 border-blue-500' : 'bg-transparent'}`}></div>
                ))}
            </div>

            {error && <p className="text-red-500 h-6">{error}</p>}
            {message && <p className="text-green-600 h-6">{message}</p>}

            <div className="grid grid-cols-3 gap-6 mt-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button key={num} onClick={() => handleKeyPress(num)} disabled={isLoading}
                            className="w-20 h-20 rounded-full bg-white text-2xl font-semibold shadow-md active:bg-gray-200 disabled:opacity-50">
                        {num}
                    </button>
                ))}

                {/* --- TOMBOL BARU UNTUK RESET PIN --- */}
                <button onClick={handlePinReset} disabled={isLoading}
                        className="w-20 h-20 text-blue-600 font-semibold text-sm disabled:opacity-50">
                    Lupa PIN?
                </button>

                <button onClick={() => handleKeyPress(0)} disabled={isLoading}
                        className="w-20 h-20 rounded-full bg-white text-2xl font-semibold shadow-md active:bg-gray-200 disabled:opacity-50">
                    0
                </button>
                <button onClick={handleDelete} disabled={isLoading}
                        className="w-20 h-20 flex items-center justify-center text-gray-600 disabled:opacity-50">
                    <BackspaceIcon/>
                </button>
            </div>
        </div>
    );
}