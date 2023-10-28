contract Voter {

    #[aztec(private)]
    fn constructor() {}

    #[aztec(private)]
    fn vote(
        vote: Field,
    ) -> Field{
        vote
    }
}
