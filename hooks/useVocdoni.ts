import {Election, EnvOptions, PlainCensus, VocdoniSDKClient} from '@vocdoni/sdk';
import delay from '../utils/delay';
import {ethers} from "ethers";


export default function useVocdoni() {
    const initClient = async (signer: any) => {
        const client = new VocdoniSDKClient({
            env: EnvOptions.STG,
            wallet: signer,
        });

        console.log('Creating account...');
        const info = await client.createAccount()
        if (info.balance <= 10) {
            console.log('Funding account...');
            await client.collectFaucetTokens()
        }
        console.log('Account created:', info);
        return client;
    }

    const createElection = (census: any, title: string, desc: string, endDate: Date, imageUri: string) => {
        const election = Election.from({
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

    const initElection = async (signer:any, voters: string[], title: string, desc: string, endDate: Date, imageUri: string, questions: any[]) => {
        const client = await initClient(signer)
        const census = new PlainCensus()
        voters.map((voter) => census.add(voter))
        const randomWallet = ethers.Wallet.createRandom()
        census.add(randomWallet.address)
        const election = createElection(census, title, desc, endDate, imageUri)
        console.log('Adding questions...');
        questions.map((question) => addQuestion(election, question.title, question.description, question.options))
        console.log('Questions added')
        const electionId = await client!.createElection(election)
        console.log('Election created:', electionId);
        client!.setElectionId(electionId)
        await delay(14000)
        return electionId;
    }

    return {
        initClient,
        initElection,
    }
}