import React, { useState } from 'react';

export function PinSettings() {
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [message, setMessage] = useState({text: '', type: ''});

    const handleChangePin = () => {
        const storedPin = localStorage.getItem('moneyplus_pin') || '123456';
        if (currentPin !== storedPin) {
            setMessage({text: 'PIN lama salah.', type: 'error'});
            return;
        }
        if (newPin.length !== 6) {
            setMessage({text: 'PIN baru harus 6 digit.', type: 'error'});
            return;
        }
        if (newPin !== confirmPin) {
            setMessage({text: 'Konfirmasi PIN baru tidak cocok.', type: 'error'});
            return;
        }
        localStorage.setItem('moneyplus_pin', JSON.stringify(newPin));
        setMessage({text: 'PIN berhasil diubah!', type: 'success'});
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Ubah PIN Keamanan</h2>
            {message.text &&
                <p className={`p-3 rounded-lg text-sm mb-4 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</p>
            }
            <div className="space-y-4">
                <input type="password" value={currentPin} onChange={e => setCurrentPin(e.target.value)}
                       placeholder="PIN Lama" maxLength="6"
                       className="w-full px-4 py-2 bg-gray-100 border rounded-lg"/>
                <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)}
                       placeholder="PIN Baru (6 digit)" maxLength="6"
                       className="w-full px-4 py-2 bg-gray-100 border rounded-lg"/>
                <input type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value)}
                       placeholder="Konfirmasi PIN Baru" maxLength="6"
                       className="w-full px-4 py-2 bg-gray-100 border rounded-lg"/>
                <button onClick={handleChangePin}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Simpan PIN
                </button>
            </div>
        </div>
    );
}