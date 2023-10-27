//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

contract VotingRoom {
    uint256 public yesVotes = 0;
    uint256 public noVotes = 0;

    mapping(address => bool) public hasCastedVote;

    address public organizer;

    constructor(address _organizer) {
        organizer = _organizer;
    }

    function registerVoter(address _voter) public isOrganizer {
      require(hasCastedVote[_voter] != true, "Already voted!");
      hasCastedVote[_voter] = false;
    }

    function vote(bool _vote) public isEligibleVote {
        if (_vote) {
            yesVotes++;
        } else {
            noVotes++;
        }
        hasCastedVote[msg.sender] = true;
    }

    modifier isEligibleVote() {
        // TODO: replace below with ZK-magic
        require(hasCastedVote[msg.sender] == false, "Already voted");
        _;
    }

    modifier isOrganizer() {
        require(msg.sender == organizer, "Only organizer can call this function");
        _;
    }
}
