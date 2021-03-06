/*

    Copyright 2020 Kollateral LLC
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

*/
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.1;

import "./KToken.sol";
import "../CollateralizedERC20.sol";

contract KERC20 is KToken, CollateralizedERC20 {
	constructor(
		address underlying,
		string memory name,
		string memory symbol
	) CollateralizedToken(underlying) ERC20(name, symbol) {}

	// TODO: define role that receive/fallback default functions can play within the protocol inner workings
	receive() external payable {}
}
