import {useForm} from "@mantine/form"
import {
    ActionIcon,
    Button,
    Group,
    NumberInput,
    Paper,
    Stack,
    Text,
    Textarea,
    TextInput
} from "@mantine/core";
import {ImageInput} from "./ImageInput";
import {useContext, useEffect, useState} from "react";
import {DatePicker} from "@mantine/dates";
import {IconCircleMinus} from "@tabler/icons";
import useNftStorage from "../hooks/useNftStorage";
import {showNotification, updateNotification} from "@mantine/notifications";
import useVocdoni from "../hooks/useVocdoni";
import {GlobalContext} from "../contexts/GlobalContext";
import {useRouter} from "next/router";
import dayjs from "dayjs";
import {useAccount, useSigner} from "wagmi";
import {useIsMounted} from "../hooks/useIsMounted";

export default function PollCreationForm(props: any) {
    const [image, setImage] = useState<File>()
    const {uploadImage} = useNftStorage();
    const {initElection} = useVocdoni()
    const {data: signer} = useSigner()
    const {address} = useAccount()
    const mounted = useIsMounted()
    const [submitting, setSubmitting] = useState(false)
    // @ts-ignore
    const {orbis} = useContext(GlobalContext)
    const router = useRouter()

    useEffect(() => {
        if(!mounted) return
        if(!address) return
        (async() => {
            console.log("address", address)
        })()
    }, [mounted, address])

    const form = useForm({
        initialValues: {
            topic: "",
            description: "",
            imageUri: "",
            endDate: "",
            endHour: 0,
            endMinute: 0,
            questions: [
                {
                    title: "",
                    description: "",
                    options: [
                        {
                            title: "",
                            value: 0
                        },
                        {
                            title: "",
                            value: 1
                        }
                    ]
                }
            ]
        }
    })

    return (
        <form onSubmit={
            form.onSubmit(async (values) => {
                setSubmitting(true)
                if (!image) {
                    showNotification({
                        title: "Error",
                        message: "Please upload an image",
                        color: "red"
                    })
                    return
                }
                showNotification({
                    title: "Creating poll",
                    message: "Please wait while we create this poll.",
                    id: 'load-data',
                    loading: true,
                    autoClose: false,
                    disallowClose: true,
                })
                const cid = await uploadImage(image)
                form.setFieldValue("imageUri", `https://${cid}.ipfs.nftstorage.link`)
                const imageUri = `https://${cid}.ipfs.nftstorage.link`
                const {groupId} = router.query
                const {data, error} = await orbis.getGroupMembers(groupId)
                console.log(data)
                const mentions = data.map((member: any) => ({did: member.profile_details.did, username: member.profile_details.profile.username as string}))
                const groupMembers = data.map((member: any) => member.did.slice(-42))
                try {
                    const endDate = new Date(values.endDate)
                    endDate.setHours(values.endHour)
                    endDate.setMinutes(values.endMinute)
                    const electionId = await initElection(signer, groupMembers, values.topic, values.description, endDate, imageUri, values.questions)
                    console.log(groupId)
                    console.log(electionId)

                    const res = await orbis.createPost(
                        {
                            context: `${groupId}`,
                            body: `${electionId}`,
                            tags: [{
                                slug: "poll",
                                title: "Poll"
                            }],
                        }
                    )
                    if (res.status === 200) {
                        updateNotification({
                            title: "Poll created",
                            message: "Your poll has been created successfully.",
                            id: 'load-data',
                            autoClose: 5000,
                        })
                        setSubmitting(false)
                        form.reset()
                    } else {
                        updateNotification({
                            title: "Error",
                            message: "There was an error creating your poll.",
                            id: 'load-data',
                            autoClose: 5000,
                        })
                        setSubmitting(false)
                    }
                } catch (e) {
                    console.log(e)
                    updateNotification({
                        id: 'load-data',
                        title: "Unable to creat poll",
                        message: "Please try again!",
                        color: "red",
                        autoClose: 5000
                    })
                    setSubmitting(false)
                }
            })
        }>
            <Paper p={"lg"} m={"lg"} radius={"lg"}>
                <TextInput mb={"md"} {...form.getInputProps("topic")} required label={"Poll Topic"}
                           placeholder={"Enter the topic of this poll"}/>
                <Textarea my={"md"} {...form.getInputProps("description")} required label={"Poll Description"}
                          placeholder={"Enter the description of this poll"}/>
                <Stack>
                    <Text>Upload an image for this poll <span style={{color: "red"}}>*</span></Text>
                    <ImageInput value={image} onChange={setImage}/>
                </Stack>
                <DatePicker my={"md"} label={"End Date"}
                            minDate={dayjs(new Date()).toDate()}
                            placeholder={"When should this pole end?"} {...form.getInputProps("endDate")} required/>
                <NumberInput my={"md"} label={"End Hour (24 hour format)"} placeholder={"10"} {...form.getInputProps("endHour")} required min={0} max={23} />
                <NumberInput my={"md"} label={"End Minute"} placeholder={"10"} {...form.getInputProps("endMinute")} required min={0} max={59} />
                <Text>Questions</Text>
                {
                    form.values.questions.map((question: any, index: number) => {
                        return (
                            <Paper key={index} my={"md"}>
                                <TextInput mb={"md"} {...form.getInputProps(`questions.${index}.title`)} required
                                           label={"Question Title"}
                                           placeholder={"Enter the title of this question"}/>
                                <Textarea my={"md"} {...form.getInputProps(`questions.${index}.description`)} required
                                          label={"Question Description"}
                                          placeholder={"Enter the description of this question"}/>
                                {
                                    question.options.map((choice: any, index2: number) => {
                                        return (
                                            <Group>
                                                <TextInput key={index2}
                                                           mb={"md"} {...form.getInputProps(`questions.${index}.options.${index2}.title`)}
                                                           required label={"Choice"}
                                                           placeholder={"Enter the choice"}/>
                                                <ActionIcon
                                                    onClick={() => form.removeListItem(`questions.${index}.options`, index2)}><IconCircleMinus
                                                    color={"red"} size={16}/></ActionIcon>
                                            </Group>
                                        )
                                    })
                                }
                                <Button disabled={submitting} variant={"subtle"} onClick={() => {
                                    form.insertListItem(`questions.${index}.options`, {
                                        body: "",
                                        value: form.values.questions[index].options.length
                                    })
                                }}>Add a new choice</Button>
                                <Button disabled={submitting} color={"red"} variant={"subtle"} onClick={() => {
                                    form.removeListItem(`questions`, index)
                                }}>Remove Question</Button>
                            </Paper>
                        )
                    })
                }
                <Button disabled={submitting} mb={"md"} variant={"light"} color={"green"} onClick={() => {
                    form.insertListItem(`questions`, {
                        title: "",
                        description: "",
                        options: [
                            {
                                title: "",
                                value: 0
                            },
                            {
                                title: "",
                                value: 1
                            }
                        ]
                    })
                }
                }>
                    Add a new question
                </Button>
                <Button disabled={!props.spaceMember || submitting} type={"submit"} fullWidth>
                    Submit
                </Button>

            </Paper>
        </form>
    )

}