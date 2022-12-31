import {Button, Text, Title} from "@mantine/core";

export default function NotExisting(){
    return(
        <>
            <Title>404</Title>
            <Text>
                This page does not exist
            </Text>
            <Button component={"a"} href={"/"}>Go back to home</Button>
        </>
    )
}