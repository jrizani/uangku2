import React from "react";
import {formatCurrency} from "../../utils/helpers";
import {BackspaceIcon, ChevronDownIcon} from "../../utils/icons";

export const NumericKeypad = ({onKeyPress, onDelete, onHide, displayValue}) => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '000'];
    const KeyButton = ({children, onClick, className = ""}) => (<button onClick={onClick}
                                                                        className={`bg-white/50 backdrop-blur-sm h-14 flex justify-center items-center text-2xl font-medium text-gray-800 active:bg-gray-300 transition-colors rounded-md ${className}`}>{children}</button>);
    return (
        <div onClick={(e) => e.stopPropagation()}
             className="fixed bottom-0 left-0 right-0 bg-gray-200/80 p-2 z-[60] shadow-lg animate-keypad-up">
            <div className="max-w-lg mx-auto text-right px-2 pb-2">
                <p className="text-3xl font-bold text-gray-800">{formatCurrency(displayValue || 0)}</p>
            </div>
            <div className="grid grid-cols-3 grid-rows-4 gap-2 max-w-lg mx-auto">
                {keys.map(key => <KeyButton key={key} onClick={() => onKeyPress(key)}>{key}</KeyButton>)}
                <KeyButton onClick={onDelete}><BackspaceIcon/></KeyButton>
            </div>
            <div className="max-w-lg mx-auto mt-2">
                <button onClick={onHide}
                        className="w-full h-12 bg-gray-300/80 text-gray-700 font-bold rounded-lg flex justify-center items-center">
                    <ChevronDownIcon/></button>
            </div>
        </div>
    );
};