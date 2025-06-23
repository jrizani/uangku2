import React, {useState} from "react";
import {CloseIcon} from "../../utils/icons";

export function SettingsModal({onClose}) {
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
        localStorage.setItem('moneyplus_pin', newPin);
        setMessage({text: 'PIN berhasil diubah!', type: 'success'});
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 relative animate-fade-in-up"
                 onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Pengaturan</h2>
                    <button onClick={onClose}><CloseIcon/></button>
                </div>
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">Ubah PIN Keamanan</h3>
                    {message.text &&
                        <p className={`p-2 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</p>}
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
                            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Simpan PIN
                    </button>
                </div>
            </div>
        </div>
    );
}