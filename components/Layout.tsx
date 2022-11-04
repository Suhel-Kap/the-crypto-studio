import { HeaderSimple } from "./HeaderSimple"
import { AppShell, Footer } from "@mantine/core"

export function Layout({ children }) {
    return (
        <AppShell
            padding="md"
            header={<HeaderSimple />}
            footer={<Footer height={60} p={"md"}> Application Footer </Footer>}
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