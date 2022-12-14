import {Badge, Image, Paper, Title} from "@mantine/core";

export default function ElectionCard(props: any){
    console.log("data", props.data)
    console.log("Header", props?.data?.metadata?.media?.header)
    const now = new Date()
    const isLive = now.getTime() < new Date(props?.data?.endDate).getTime()
    return (
        <Paper radius={"md"} p={"md"} component={"a"} href={`/voting/?electionID=${props.data.electionId}`}
            sx={{
                cursor: "pointer",
            }}
        >
            <Image
                withPlaceholder
                src={props?.data?.metadata?.media?.header}
                fit={"contain"}
                height={300}
                radius={"md"}
                my={"md"}
                width={"100%"}
                alt={"Election header"}
            />
            <Title order={3}>{props?.data?.metadata?.title?.default}</Title>
            <Badge color={"cyan"}>
                {isLive ? "Live" : "Ended"}
            </Badge>
        </Paper>
    )
}