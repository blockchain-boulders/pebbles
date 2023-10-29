use dep::aztec::{
    note::{
        note_header::NoteHeader,
        note_interface::NoteInterface,
        utils::{compute_siloed_note_hash, compute_note_hash_for_read_or_nullify},
    },
    hash::{compute_secret_hash, pedersen_hash},
    context::PrivateContext,
    log::emit_encrypted_log,
};
use dep::aztec::types::address::AztecAddress;
use dep::aztec::oracle::{
    rand::rand,
    get_secret_key::get_secret_key,
    get_public_key::get_public_key,
};

// Length is 3 properties + header
global LOCKED_VOTE_NOTE_LEN = 3;

// A locked vote is still hidden from the tally but can no longer be changed.
struct LockedVoteNote {
    // the vote type, represented as a number value
    vote: Field,
    owner: AztecAddress,
    // add randomness so hash cannot be repeated accross votes
    randomness: Field,
    // satisfy NoteInterface
    header: NoteHeader,
}

impl LockedVoteNote {
    pub fn new(vote: Field, owner: AztecAddress) -> Self {
        LockedVoteNote {
            vote,
            owner,
            randomness: rand(),
            header: NoteHeader::empty(),
        }
    }

    // STANDARD NOTE_INTERFACE FUNCTIONS

    pub fn serialize(self) -> [Field; LOCKED_VOTE_NOTE_LEN] {
        [self.vote, self.owner.address, self.randomness]
    }

    pub fn deserialize(preimage: [Field; LOCKED_VOTE_NOTE_LEN]) -> Self {
        LockedVoteNote {
            vote: preimage[0],
            owner: AztecAddress::new(preimage[1]),
            randomness: preimage[2],
            header: NoteHeader::empty(),
        }
    }

    pub fn compute_note_hash(self) -> Field {
        // TODO(#1205) Should use a non-zero generator index.
        pedersen_hash([
            self.vote,
            self.owner.address,
            self.randomness,
        ],0)
    }

    pub fn compute_nullifier(self) -> Field {
        let note_hash_for_nullify = compute_note_hash_for_read_or_nullify(LockedVoteNoteMethods, self);
        let secret = get_secret_key(self.owner.address);
        // TODO(#1205) Should use a non-zero generator index.
        pedersen_hash([
            note_hash_for_nullify,
            secret.low,
            secret.high,
        ],0)
    }

    pub fn set_header(&mut self, header: NoteHeader) {
        self.header = header;
    }

    // Broadcasts the note as an encrypted log on L1.
    pub fn broadcast(self, context: &mut PrivateContext, slot: Field) {
        // We only bother inserting the note if non-empty to save funds on gas.
        let encryption_pub_key = get_public_key(self.owner.address);
        emit_encrypted_log(
            context,
            (*context).this_address(),
            slot,
            encryption_pub_key,
            self.serialize(),
        );
  }
}

fn deserialize(preimage: [Field; LOCKED_VOTE_NOTE_LEN]) -> LockedVoteNote {
    LockedVoteNote::deserialize(preimage)
}

fn serialize(note: LockedVoteNote) -> [Field; LOCKED_VOTE_NOTE_LEN] {
    note.serialize()
}

fn compute_note_hash(note: LockedVoteNote) -> Field {
    note.compute_note_hash()
}

fn compute_nullifier(note: LockedVoteNote) -> Field {
    note.compute_nullifier()
}

fn get_header(note: LockedVoteNote) -> NoteHeader {
    note.header
}

fn set_header(note: &mut LockedVoteNote, header: NoteHeader) {
    note.set_header(header)
}

fn broadcast(context: &mut PrivateContext, slot: Field, note: LockedVoteNote) {
    note.broadcast(context, slot)
}

global LockedVoteNoteMethods = NoteInterface {
    deserialize,
    serialize,
    compute_note_hash,
    compute_nullifier,
    get_header,
    set_header,
    broadcast,
};