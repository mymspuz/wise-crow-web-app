import React from 'react'
import { JSX } from 'react/jsx-runtime'

import './Button.css'

const Button = (props: JSX.IntrinsicAttributes & React.ClassAttributes<HTMLButtonElement> & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
        <button {...props} className={'button ' + props.className} />
    );
};

export default Button