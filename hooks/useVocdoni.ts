import {Election, EnvironmentInitialitzationOptions, PlainCensus, VocdoniSDKClient, Vote} from '@vocdoni/sdk';

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default function useVocdoni() {
    const initClient = async (signer: any) => {
        const client = new VocdoniSDKClient({
            env: EnvironmentInitialitzationOptions.DEV,
            wallet: signer,
        });

        console.log('Creating account...');
        const info = await client.createAccount()
        if (info.balance === 0) {
            await client.collectFaucetTokens()
        }
        console.log('Account created:', info);
        return client;
    }

    const createElection = (census: any, title: string, desc: string, endDate: Date, imageUri: string) => {

        const election = new Election({
            title: title,
            description: desc,
            header: imageUri,
            streamUri: imageUri,
            endDate: endDate.getTime(),
            census,
        });
        return election;
    }

    const addQuestion = (election: any, title: string, description: string, options: any[]) => {
        election.addQuestion(title, description, options);
    }

    const initElection = async (signer: any, voters: string[], title: string, desc: string, endDate: Date, imageUri: string, questions: any[]) => {
        const client = await initClient(signer)
        const census = new PlainCensus()
        voters.map((voter) => census.add(voter))
        const election = createElection(census, title, desc, endDate, imageUri)
        console.log('Adding questions...');
        questions.map((question) => addQuestion(election, question.title, question.description, question.options))
        console.log('Questions added');

        await client.createElection(election).then((electionId: string) => {
            console.log('Election created with id: ' + electionId);
            client.setElectionId(electionId);
            console.log('Waiting for block confirmation...');
            return delay(14000);
        })
    }

    const vote = async (signer: any,electionId: string, choice: any[]) => {
        const client = await initClient(signer);
        client.setElectionId(electionId);
        const vote = new Vote([...choice])
        const info = await client.fetchElection()
        console.log(info)
        try {
            await client.submitVote(vote)
            console.log('Vote submitted');
        } catch (e) {
            console.log(e);
        }
    }

    return {
        initClient,
        initElection,
        vote
    }
}