// contract Voter {

//     #[aztec(private)]
//     fn constructor() {}

//     #[aztec(private)]
//     fn vote(
//         vote: Field,
//     ) -> Field{
//         vote
//     }
// }

contract Tallier {

    use dep::aztec::{
        context::{PublicContext, Context},
        state_vars::{public_state::PublicState},
        types::type_serialization::{
            field_serialization::{FieldSerializationMethods, FIELD_SERIALIZED_LEN},
        }
    };


    struct Storage {
        vote1: PublicState<Field, FIELD_SERIALIZED_LEN>
    }

    impl Storage {
        fn init(context: Context) -> Self {
            Storage {
                vote1: PublicState::new(context, 1, FieldSerializationMethods)
            }
        }
    }

    #[aztec(private)]
    fn constructor() {}

    #[aztec(public)]
    fn receive_vote(
        vote: Field,
    ) -> Field{
        storage.vote1.write(vote);
    }

    unconstrained fn read_vote() -> Field {
        storage.vote1.read()
    }
}