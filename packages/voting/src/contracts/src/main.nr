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

// contract Tallier {

//     struct Storage {
//         vote1:
//         vote2: 
//     }

//     #[aztec(private)]
//     fn constructor() {}

//     #[aztec(private)]
//     fn vote(
//         vote: Field,
//     ) -> Field{
//         vote
//     }
// }