import React, {useState} from "react";
import {formatCurrency} from "../../utils/helpers";
import {BackspaceIcon, ChevronDownIcon} from "../../utils/icons";

const OPERATION_MAP = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '×': (a, b) => a * b,
    '÷': (a, b) => b === 0 ? 0 : a / b,
};

export const NumericKeypad = ({value = '', onChange, onHide}) => {
    const [inputValue, setInputValue] = useState(() => value?.toString() || '');
    const [accumulator, setAccumulator] = useState(null);
    const [pendingOperation, setPendingOperation] = useState(null);
    const [waitingForNextValue, setWaitingForNextValue] = useState(false);

    const notifyChange = (val) => {
        if (!onChange) return;
        onChange(val);
    };

    const appendValue = (val) => {
        setInputValue(prev => {
            let nextValue = prev || '';
            if (waitingForNextValue) {
                nextValue = '';
                setWaitingForNextValue(false);
            }
            if (val === '.') {
                if (nextValue.includes('.')) return nextValue;
                nextValue = nextValue ? `${nextValue}.` : '0.';
            } else if (val === '000') {
                nextValue = nextValue ? `${nextValue}000` : '0';
            } else {
                nextValue = nextValue === '0' ? val : `${nextValue}${val}`;
            }
            notifyChange(nextValue);
            return nextValue;
        });
    };

    const applyOperation = (currentValue) => {
        if (pendingOperation == null || accumulator == null) {
            return currentValue;
        }
        const operatorFn = OPERATION_MAP[pendingOperation];
        const result = operatorFn(accumulator, currentValue);
        setAccumulator(result);
        setInputValue(result.toString());
        notifyChange(result.toString());
        return result;
    };

    const handleOperation = (symbol) => {
        const current = parseFloat(inputValue || '0');
        if (pendingOperation && !waitingForNextValue) {
            const result = applyOperation(current);
            setAccumulator(result);
        } else {
            setAccumulator(current);
        }
        setPendingOperation(symbol);
        setWaitingForNextValue(true);
    };

    const handleEquals = () => {
        if (pendingOperation == null) return;
        const current = parseFloat(inputValue || (waitingForNextValue ? accumulator : 0));
        const result = applyOperation(isNaN(current) ? 0 : current);
        setPendingOperation(null);
        setAccumulator(result);
        setWaitingForNextValue(true);
    };

    const handleDelete = () => {
        setInputValue(prev => {
            if (waitingForNextValue) {
                setWaitingForNextValue(false);
                return prev;
            }
            const next = prev.slice(0, -1);
            notifyChange(next);
            return next;
        });
    };

    const handleClear = () => {
        setInputValue('');
        setAccumulator(null);
        setPendingOperation(null);
        setWaitingForNextValue(false);
        notifyChange('');
    };

    const numberRows = [
        ['7', '8', '9', '÷'],
        ['4', '5', '6', '×'],
        ['1', '2', '3', '-'],
        ['0', '000', '.', '+']
    ];

    const KeyButton = ({children, onClick, className = ""}) => (
        <button onClick={onClick}
                className={`bg-white/70 backdrop-blur-sm h-14 flex justify-center items-center text-2xl font-medium text-gray-800 active:bg-gray-300 transition-colors rounded-md ${className}`}>
            {children}
        </button>
    );

    const displayAmount = inputValue === '' ? 0 : Number(inputValue);

    return (
        <div onClick={(e) => e.stopPropagation()}
             className="fixed bottom-0 left-0 right-0 bg-gray-200/90 p-2 z-[60] shadow-lg animate-keypad-up">
            <div className="max-w-lg mx-auto text-right px-2 pb-2">
                {pendingOperation && accumulator != null && (
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                        {formatCurrency(accumulator)} {pendingOperation}
                    </p>
                )}
                <p className="text-3xl font-bold text-gray-800">{formatCurrency(displayAmount)}</p>
            </div>
            <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto">
                {numberRows.map((row, rowIndex) => row.map((item) => (
                    <KeyButton
                        key={`${rowIndex}-${item}`}
                        onClick={() => {
                            if (OPERATION_MAP[item]) {
                                handleOperation(item);
                            } else {
                                appendValue(item);
                            }
                        }}
                        className={OPERATION_MAP[item] ? 'bg-blue-100 text-blue-700' : ''}
                    >
                        {item}
                    </KeyButton>
                )))
                }
                <KeyButton onClick={handleClear} className="col-span-1 text-lg">C</KeyButton>
                <KeyButton onClick={handleDelete} className="col-span-1"><BackspaceIcon/></KeyButton>
                <KeyButton onClick={handleEquals} className="col-span-2 bg-blue-600 text-white text-2xl">=</KeyButton>
            </div>
            <div className="max-w-lg mx-auto mt-2">
                <button onClick={onHide}
                        className="w-full h-12 bg-gray-300/80 text-gray-700 font-bold rounded-lg flex justify-center items-center">
                    <ChevronDownIcon/></button>
            </div>
        </div>
    );
};
