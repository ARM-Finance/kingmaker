/*

	Copyright (c) [2020] [Archer DAO]
    Copyright 2020-2021 ARM Finance LLC

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

          __...--~~~~~-._   _.-~~~~~--...__
        //               `V'               \\
       //                 |                 \\
      //__...--~~~~~~-._  |  _.-~~~~~~--...__\\
     //__.....----~~~~._\ | /_.~~~~----.....__\\
    ====================\\|//====================
                        `---`
*/
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.2;

import "hardhat/console.sol";

/**
 * @title Scribe (prev. TokenRegistry)
 * @dev Maintains the official registry of tokens (along with their respective conversion formulae)
 * 		counted by the Crown and Bailiff in voting power calculations
 */
contract Scribe {
	/// @notice Current owner of this contract
	address public clergy;

	/// @notice mapping of tokens to voting power calculation (formula) smart contract addresses
	mapping(address => address) public tokenFormulae;

	/// @notice Event emitted when the owner of the contract is updated
	event ApostolicSuccession(address indexed oldOwner, address indexed newOwner);

	/// @notice Event emitted when a token formula is updated
	event TokenFormulaUpdated(address indexed token, address indexed formula);

	/// @notice Event emitted when a supported token is removed
	event TokenRemoved(address indexed token);

	/// @notice only clergy can call function
	modifier onlyTheChurch {
		require(msg.sender == clergy, "Scribe::onlyTheChurch: not clergy");
		_;
	}

	/**
	 * @notice Construct a new token registry contract
	 * @param _owner contract owner
	 * @param _tokens initially supported tokens
	 * @param _formulas formula contracts for initial tokens
	 */
	constructor(
		address _owner,
		address[] memory _tokens,
		address[] memory _formulas
	) {
		require(_tokens.length == _formulas.length, "Scribe::constructor: not same length");
		for (uint256 i = 0; i < _tokens.length; i++) {
			tokenFormulae[_tokens[i]] = _formulas[i];
			emit TokenFormulaUpdated(_tokens[i], _formulas[i]);
		}
		clergy = _owner;
		emit ApostolicSuccession(address(0), clergy);
	}

	/**
	 * @notice Set conversion formula address for token
	 * @param token token for formula
	 * @param formula address of formula contract
	 */
	function setTokenFormula(address token, address formula) external onlyTheChurch {
		tokenFormulae[token] = formula;
		emit TokenFormulaUpdated(token, formula);
	}

	/**
	 * @notice Remove conversion formula address for token
	 * @param token token address to remove
	 */
	function removeToken(address token) external onlyTheChurch {
		tokenFormulae[token] = address(0);
		emit TokenRemoved(token);
	}

	/**
	 * @notice Change owner of token registry contract
	 * @param newOwner New owner address
	 */
	function changeOwner(address newOwner) external onlyTheChurch {
		emit ApostolicSuccession(clergy, newOwner);
		clergy = newOwner;
	}
}
