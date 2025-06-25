import React, { useState, useRef } from 'react';
import { PinKeypadInput } from './PinKeypadInput';

export function PinSettings() {
    const [step, setStep] = useState('current'); // 'current', 'new', 'confirm'
    const [message, setMessage] = useState({text: '', type: ''});
    const [currentPin, setCurrentPin] = useState('');
    const newPinRef = useRef(''); // Gunakan ref untuk menyimpan PIN baru sementara

    const resetState = () => {
        setStep('current');
        setCurrentPin('');
        newPinRef.current = '';
    }

    const handleCurrentPinComplete = (pin) => {
        const storedPin = JSON.parse(localStorage.getItem('moneyplus_pin')) || '123456';
        if (pin === storedPin) {
            setMessage({text: 'PIN lama benar. Masukkan PIN baru.', type: 'success'});
            setStep('new');
        } else {
            setMessage({text: 'PIN lama salah.', type: 'error'});
            // Untuk memanggil fungsi shake, kita perlu cara lain. Untuk saat ini kita reset saja.
            // Sayangnya, kita tidak bisa memanggil shake dari sini dengan mudah.
        }
    };

    const handleNewPinComplete = (pin) => {
        newPinRef.current = pin;
        setMessage({text: 'PIN baru diterima. Konfirmasi sekali lagi.', type: 'success'});
        setStep('confirm');
    };

    const handleConfirmPinComplete = (pin) => {
        if (pin === newPinRef.current) {
            localStorage.setItem('moneyplus_pin', JSON.stringify(pin));
            setMessage({text: 'PIN berhasil diubah!', type: 'success'});
            setTimeout(() => {
                setMessage({text: '', type: ''});
                resetState();
            }, 2000);
        } else {
            setMessage({text: 'Konfirmasi PIN tidak cocok. Silakan ulangi.', type: 'error'});
            setTimeout(() => {
                setMessage({text: '', type: ''});
                resetState();
            }, 2000);
        }
    };

    return (
        <div>
            {message.text && (
                <p className={`p-3 rounded-lg text-sm mb-4 text-center ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message.text}
                </p>
            )}

            {step === 'current' && (
                <PinKeypadInput
                    title="Masukkan PIN Lama Anda"
                    onPinComplete={handleCurrentPinComplete}
                />
            )}
            {step === 'new' && (
                <PinKeypadInput
                    title="Masukkan PIN Baru (6 digit)"
                    onPinComplete={handleNewPinComplete}
                    onCancel={resetState}
                    cancelText="Batal"
                />
            )}
            {step === 'confirm' && (
                <PinKeypadInput
                    title="Konfirmasi PIN Baru Anda"
                    onPinComplete={handleConfirmPinComplete}
                    onCancel={resetState}
                    cancelText="Batal"
                />
            )}
        </div>
    );
}