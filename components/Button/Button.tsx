import {
    Button as MantineButton,
    Loader,
    useMantineTheme,
} from '@mantine/core';

import React from 'react';
// import useStyles, {ButtonVariant} from './Button.styles';

export interface ButtonProps {
    children?: React.ReactNode;
    // variant: ButtonVariant;
    disabled?: boolean;
    loading?: boolean;
    onClick?: (value: any) => void;
    leftIcon?: React.ReactNode;
    style?: React.CSSProperties;
    type?: 'submit' | 'button' | 'reset';
}

export function Button(props: ButtonProps) {
    const theme = useMantineTheme();
    // const {classes} = useStyles({variant: props.variant});
    const {children, loading, ...rest} = props;

    const loader = () => {
        return <React.Fragment>Loading...</React.Fragment>;

    };

    return (
        <MantineButton color={"indigo"} mt={"xl"} {...rest}>
            {props.loading ? loader() : props.children}
        </MantineButton>
    );
}

Button.defaultProps = {
    variant: 'primary',
}