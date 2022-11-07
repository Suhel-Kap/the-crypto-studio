import { HeaderSimple } from "./HeaderSimple"
import { AppShell, Footer } from "@mantine/core"
import {NavbarSide} from "./Navbar";
import {ReactNode} from "react";

interface Props {
    children?: ReactNode
    // any props that come into the component
}

export function Layout({ children }: Props) {
    return (
        <AppShell
            padding="md"
            header={<HeaderSimple />}
            navbar={<NavbarSide />}
            footer={<Footer height={60} p={"md"}> All rights reserved. </Footer>}
            styles={(theme) => ({
                main: {
                    backgroundColor:
                        theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
                },
            })}
        >
            {children}
        </AppShell>
    )
}