contract Tallier {

    use dep::aztec::{
        context::{PublicContext, Context},
        state_vars::{public_state::PublicState, map::Map},
        types::type_serialization::{
            field_serialization::{FieldSerializationMethods, FIELD_SERIALIZED_LEN},
        },
        types::address::{AztecAddress},

    };

    struct Storage {
        votes: Map<PublicState<Field, FIELD_SERIALIZED_LEN>>,
        voterAddresses: Map<PublicState<Field, FIELD_SERIALIZED_LEN>>,
        voteCounter: PublicState<Field, FIELD_SERIALIZED_LEN>,
        votingResults: Map<PublicState<Field, FIELD_SERIALIZED_LEN>>,
    }

    impl Storage {
        fn init(context: Context) -> Self {
            Storage {
                votes: Map::new(
                    context,
                    1,
                    |context, slot| {
                        PublicState::new(
                            context,
                            slot,
                            FieldSerializationMethods,
                        )
                    },
                ),
                voterAddresses: Map::new(
                    context,
                    2,
                    |context, slot| {
                        PublicState::new(
                            context,
                            slot,
                            FieldSerializationMethods,
                        )
                    },
                ),
                voteCounter: PublicState::new(
                    context,
                    3,
                    FieldSerializationMethods,
                ),
                votingResults: Map::new(
                    context,
                    4,
                    |context, slot| {
                        PublicState::new(
                            context,
                            slot,
                            FieldSerializationMethods,
                        )
                    },
                ),
            }
        }
    }

    #[aztec(private)]
    fn constructor() {}

    #[aztec(public)]
    fn receiveVote(
        vote: Field,
        voterAddress: Field
    ) {
        assert(vote as u32 > 0, "vote should be greater than 0");
        assert(storage.votes.at(voterAddress).read() as u32 <= 0, "already voted");

        storage.voterAddresses.at(storage.voteCounter.read()).write(voterAddress);
        storage.votes.at(voterAddress).write(vote);
        storage.voteCounter.write(storage.voteCounter.read() + 1);
    }

    #[aztec(public)]
        fn calculateResult() {
            for i in 0..storage.voteCounter.read() {
                let voter = storage.voterAddresses.at(i).read();
                let vote = storage.votes.at(voter).read();
                storage.votingResults.at(vote).write(storage.votingResults.at(vote).read() + 1);
            }
    }

    

    unconstrained fn readVoteCounter(value: Field) -> Field {
        storage.votingResults.at(value).read()
    }
}
