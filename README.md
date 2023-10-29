# Pebbles
Two ways of voting on Aztec Network written for ETH London hackathon 2023. To run, refer to "Setup" below.

## Voting prrocesses
### MACI-like
The first one, which is also integrated with the UI, is with a trusted third party. The third party is only trusted with the identity behind the votes. He can not forge a fake result. The pros and cons are very similar to [how MACI would be done](https://medium.com/privacy-scaling-explorations/a-technical-introduction-to-maci-1-0-db95c3a9439a) with ZK-circuits on a public chain.
  Voting-process:
    a. the organizer creates a tallier contract
    b. the voter creates a voter contract
    c. the voter calls a private method, in voter contract, with their vote
    d. the voter contract calls the tallier contract public method with the vote
    e. the tallier contract stores the vote in its' private state (⚠ in current implementation it is in public state).
    f. the tallier ends the vote by calling the public summerizing method on the tallier contract
    g. the tallier contract has the result stored in its' public state
TODO: image here


### Phased voting
The second one, integrated only with typescript-tests, is called phased voting. It requires a third party, but he is only trusted to run, finish and cancel the process. Not to see any of the actual votes.
  Voting-process:
    a. the organizer creates a phase voting contract and assigns a responsible third party
    b. voters submit their votes to the voting contract, these votes are hidden but can not longer be changed after submission
    c. third party closes the voting phase
    d. voters burn their locked votes and reveal their vote, without revealing their own identity
    e. everyone can query the results of the voting

![](./images/phasedvoting.png)

## Code structure
As mentioned above there are two different implementations when you run `yarn test:integration` you run tests for both. When you run `yarn start:dev` you will run a UI that is integrated with the "MACI-like" voting process.



Everything below this line is the README from "Aztec Blank Box"-template.
---

This is a minimal [Aztec](https://aztec.network/) Noir smart contract and frontend bootstrapped with [`aztec-cli unbox`](https://github.com/AztecProtocol/aztec-packages/tree/master/yarn-project/cli). It is recommended you use the `aztec-cli unbox blank` command so that the repository is copied with needed modifications from the monorepo subpackage.

## Setup

Dependencies can be installed from the root of the package:

```bash
yarn
yarn install:noir
yarn install:sandbox
```

This sandbox requires [Docker](https://www.docker.com/) to be installed _and running_ locally. In the event the image needs updating, you can run `yarn install:sandbox` (see [sandbox docs](https://aztec-docs-dev.netlify.app/dev_docs/getting_started/sandbox) for more information.)

In addition to the usual javascript dependencies, this project requires `nargo` (package manager) and `noir` (a Domain Specific Language for SNARK proving systems) in addition to `@aztec/aztec-cli`. The former are installed within `yarn install:noir`.

## Getting started

After `yarn` has run,`yarn start:sandbox` in one terminal will launch a local instance of the Aztec sandbox via Docker Compose and `yarn start:dev` will launch a frontend app for deploying and interacting with an empty Aztec smart contract.

At this point, [http://localhost:5173](http://localhost:5173) should provide a minimal smart contract frontend.

This folder should have the following directory structure:

```
|— README.md
|— package.json
|— src
       index.html
       index.ts
       |— contracts
              |— src
                     | The Noir smart contract source files are here.
                     |— main.nr - the cloned noir contract, your starting point
                     |- interface.nr - autogenerated from main.nr when you compile
               |— Nargo.toml [Noir build file, includes Aztec smart contract dependencies]
       |— artifacts
              |  These are both generated from `contracts/` by the compile command
              |— blank_contract.json
              |— blank.ts
       |— tests
              | A simple end2end test deploying and testing the minimal contract on a local sandbox
              | using the front end helper methods in index.ts
              | The test requires the sandbox and anvil to be running (yarn start:sandbox).
              |- blank.contract.test.ts
```

Most relevant to you is likely `src/contracts/main.nr` (and the build config `src/contracts/Nargo.toml`). This contains the example blank contract logic that the frontend interacts with and is a good place to start writing Noir.

The `src/artifacts` folder can be re-generated from the command line

```bash
yarn compile
```

This will generate a [contract artifact](src/artifacts/test_contract.json) and TypeScript class for the [Aztec smart contract](src/contracts/main.nr), which the frontend uses to generate the UI.

Note: the `compile` command seems to generate a Typescript file which needs a single change -

```
import TestContractArtifactJson from 'text_contract.json' assert { type: 'json' };
// need to update the relative import to
import TestContractArtifactJson from './test_contract.json' assert { type: 'json' };
```

After compiling, you can re-deploy the updated noir smart contract from the web UI. The function interaction forms are generated from parsing the contract artifact, so they should update automatically after you recompile.

## Learn More

To learn more about Noir Smart Contract development, take a look at the following resources:

- [Awesome Noir](https://github.com/noir-lang/awesome-noir) - learn about the Noir programming language.

## Deploy on Aztec3

Coming Soon :)
