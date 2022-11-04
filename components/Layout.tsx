import { HeaderSimple } from "./HeaderSimple"
import { AppShell, Footer } from "@mantine/core"
import {NavbarSide} from "./Navbar";

export function Layout({ children }) {
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