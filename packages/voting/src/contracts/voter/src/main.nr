contract Voter {

    use dep::aztec::{
        context::{PrivateContext, PublicContext, Context},
        types::address::{AztecAddress},
        selector::compute_selector,
    };

    #[aztec(private)]
    fn constructor() {}

    #[aztec(private)]
    fn vote(
        vote: Field,
        tallierAddress: AztecAddress,
    ) -> Field{
        let selector = compute_selector("receiveVote(Field,Field)");
        let _void = context.call_public_function(tallierAddress.address, selector, [vote, context.msg_sender()]);
    }
    
}
