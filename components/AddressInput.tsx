import {AsyncInput} from "./AsyncInput";
import {ethers} from "ethers";
import {useState, useEffect} from "react";
import {useEnsAddress} from "wagmi";
import {Button} from "./Button/Button";
import {KeyboardEvent} from "react";
import {Group} from "@mantine/core";

const isENS = (address: string) => address.endsWith(".eth");
const isAddress = (address: string) => ethers.utils.isAddress(address);

export interface AddressProps {
    onSubmit: (address: string) => void;
    disabled?: boolean;
}

export function AddressInput(props: AddressProps) {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");

    const {data, isLoading} = useEnsAddress({
        name: value,
        chainId: 1,
        enabled: isENS(value),
    });

    const isValidENS = !isLoading && !!data;
    const isValid = isValidENS || isAddress(value);

    useEffect(() => {
        if (isLoading || isValid || !value) {
            setError("");
        } else if (isENS(value)) {
            setError("Cannot resolve ENS name");
        } else {
            setError("Address format is invalid");
        }
    }, [value, isLoading, isValid]);

    const submit = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key !== "Enter") return;
        event.preventDefault();

        if (isLoading || !isValid) return;
        props.onSubmit(data ?? value);
        setValue("");
    };

    return (
        <Group my={"md"}>
            <AsyncInput
                label={"Add member"}
                placeholder="Address or ENS"
                value={value}
                error={error}
                disabled={props.disabled}
                loading={isLoading}
                valid={isValid}
                onKeyPress={submit}
                onChange={(event) => setValue(event.currentTarget.value)}
            />
            <Button style={{width: 150}} onClick={(e: KeyboardEvent<HTMLElement>) => {
                if (isLoading || !isValid) return;
                props.onSubmit(data ?? value);
                setValue("");
            }}>
                Add
            </Button>
        </Group>
    );
}
