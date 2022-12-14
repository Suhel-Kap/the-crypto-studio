import {useForm} from "@mantine/form"
import {ActionIcon, Button, Center, Container, Group, Paper, Stack, Text, Textarea, TextInput} from "@mantine/core";
import {ImageInput} from "./ImageInput";
import {useState} from "react";
import {DatePicker} from "@mantine/dates";
import {IconCircleMinus} from "@tabler/icons";

export default function PollCreationForm() {
    const [image, setImage] = useState<File>()
    const form = useForm({
        initialValues: {
            topic: "",
            description: "",
            imageUri: "",
            endDate: "",
            questions: [
                {
                    title: "",
                    description: "",
                    choices: [
                        {
                            body: "",
                            value: 0
                        },
                        {
                            body: "",
                            value: 1
                        }
                    ]
                }
            ]
        }
    })

    return (
        <Paper p={"lg"} m={"lg"} radius={"lg"}>
            <TextInput mb={"md"} {...form.getInputProps("topic")} required label={"Poll Topic"}
                       placeholder={"Enter the topic of this poll"}/>
            <Textarea my={"md"} {...form.getInputProps("description")} required label={"Poll Description"}
                      placeholder={"Enter the description of this poll"}/>
            <Stack>
                <Text>Upload an image for this poll</Text>
                <ImageInput onChange={setImage}/>
            </Stack>
            <DatePicker my={"md"} label={"End Date"}
                        placeholder={"When should this pole end?"} {...form.getInputProps("endDate")} required/>
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
                                question.choices.map((choice: any, index2: number) => {
                                    return (
                                        <Group>
                                        <TextInput key={index2}
                                                   mb={"md"} {...form.getInputProps(`questions.${index}.choices.${index2}.body`)}
                                                   required label={"Choice"}
                                                   placeholder={"Enter the choice"}/>
                                            <ActionIcon onClick={() => form.removeListItem(`questions.${index}.choices`, index2)}><IconCircleMinus color={"red"} size={16} /></ActionIcon>
                                        </Group>
                                    )
                                })
                            }
                            <Button variant={"subtle"} onClick={() => {
                                form.insertListItem(`questions.${index}.choices`, {body: "", value: form.values.questions[index].choices.length + 1})
                                console.log(form.values)
                            }}>Add a new choice</Button>
                            <Button color={"red"} variant={"subtle"} onClick={() => {
                                console.log(index)
                                form.removeListItem(`questions`, index)
                                console.log(form.values)
                            }}>Remove Question</Button>
                        </Paper>
                    )
                })
            }
            <Button onClick={() => {
                form.insertListItem(`questions`, {
                    title: "",
                    description: "",
                    choices: [
                        {
                            body: "",
                            value: 0
                        },
                        {
                            body: "",
                            value: 1
                        }
                    ]
                })
            }
            }>
                Add a new question
            </Button>

        </Paper>
    )

}