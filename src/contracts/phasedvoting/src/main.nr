mod types;

contract PhasedVoting {

    use dep::aztec::{
        note::{
            note_getter_options::NoteGetterOptions,
            note_header::NoteHeader,
            utils as note_utils,
        },
        context::{PublicContext, Context},
        state_vars::{public_state::PublicState, set::Set, map::Map},
        types::type_serialization::{
            field_serialization::{FieldSerializationMethods, FIELD_SERIALIZED_LEN},
            bool_serialization::{BoolSerializationMethods, BOOL_SERIALIZED_LEN},
            aztec_address_serialization::{AztecAddressSerializationMethods, AZTEC_ADDRESS_SERIALIZED_LEN}
        },
        selector::compute_selector
    };
    use dep::aztec::types::address::AztecAddress;
    use crate::types::locked_vote_note::{LockedVoteNote, LockedVoteNoteMethods, LOCKED_VOTE_NOTE_LEN};

    struct Storage {
        votes: Set<LockedVoteNote, LOCKED_VOTE_NOTE_LEN>,
        result: Map<PublicState<Field, FIELD_SERIALIZED_LEN>>,
        closed: PublicState<bool, BOOL_SERIALIZED_LEN>,
        admin: PublicState<AztecAddress, AZTEC_ADDRESS_SERIALIZED_LEN>,
    }

    impl Storage {
        fn init(context: Context) -> Self {
            Storage {
                votes: Set::new(context, 1, LockedVoteNoteMethods),
                result: Map::new(context, 2, |context, slot| {
                    PublicState::new(context, slot, FieldSerializationMethods)
                }), 
                closed: PublicState::new(context, 3, BoolSerializationMethods),
                admin: PublicState::new(
                    context,
                    4,
                    AztecAddressSerializationMethods,
                ),
            }
        }
    }

    ///
    /// Constructor
    ///

    #[aztec(private)]
    fn constructor(admin: AztecAddress) {
        let selector = compute_selector("_initialize((Field))");
        context.call_public_function(context.this_address(), selector, [admin.address]);
    }

    ///
    /// Private methods
    ///

    #[aztec(private)]
    fn lock_vote(vote: Field) {
        let selector = compute_selector("_assert_open()");
        context.call_public_function(context.this_address(), selector, []);

        let mut locked_vote = LockedVoteNote::new(vote, AztecAddress::new(context.msg_sender()));
        storage.votes.insert(&mut locked_vote, true);
    }

    #[aztec(private)]
    fn burn_vote() {
        let selector = compute_selector("_assert_closed()");
        context.call_public_function(context.this_address(), selector, []);

        let notes = storage.votes.get_notes(NoteGetterOptions::new());

        for note in notes {
            if note.is_some() {
                let note = note.unwrap();

                let selector = compute_selector("_update_vote_result(Field)");
                context.call_public_function(context.this_address(), selector, [note.vote]);

                storage.votes.remove(note);
            }
        }
    }

    #[aztec(private)]
    fn close_voting_room() {
        let selector = compute_selector("_assert_authorized((Field))");
        context.call_public_function(context.this_address(), selector, [context.msg_sender()]);

        let selector = compute_selector("_close_voting_room()");
        context.call_public_function(context.this_address(), selector, []);
    }

    ///
    /// Internal methods
    ///

    #[aztec(public)]
    internal fn _assert_open() {
        assert(storage.closed.read() == false, "Voting room is closed.");
    }

    #[aztec(public)]
    internal fn _assert_closed() {
        assert(storage.closed.read() == true, "Voting room is not closed.");
    }

    #[aztec(public)]
    internal fn _assert_authorized(caller: AztecAddress) {
        assert(storage.admin.read().eq(caller), "Account not authorized to close voting room.");
    }

    #[aztec(public)]
    internal fn _initialize(admin: AztecAddress) {
        storage.admin.write(admin);
        storage.closed.write(false);
    }

    #[aztec(public)]
    internal fn _close_voting_room() {
        storage.closed.write(true);
    }

    #[aztec(public)]
    internal fn _update_vote_result(index: Field) {
        let old_value = storage.result.at(index).read();
        storage.result.at(index).write(old_value + 1);
    }

    ///
    /// View methods
    ///

    unconstrained fn get_result(index: Field) -> Field {
        assert(storage.closed.read() == true, "Voting room is not closed");

        let result = storage.result.at(index).read();

        result
    }

    unconstrained fn compute_note_hash_and_nullifier(contract_address: Field, nonce: Field, storage_slot: Field, preimage: [Field; LOCKED_VOTE_NOTE_LEN]) -> [Field; 4] {
        let note_header = NoteHeader::new(contract_address, nonce, storage_slot);
        
        note_utils::compute_note_hash_and_nullifier(LockedVoteNoteMethods, note_header, preimage)
    }
}
