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

import "./IWETH9.sol";

abstract contract WETHHandler {
	address payable internal _wethAddress;

	constructor(address payable wethAddress) {
		_wethAddress = wethAddress;
	}

	function wrap(uint256 tokenAmount) internal {
		require(address(this).balance >= tokenAmount, "WETHHandler: not enough ether balance");
		IWETH9(_wethAddress).deposit{ value: tokenAmount }();
	}

	function unwrap(uint256 tokenAmount) internal {
		IWETH9 weth = IWETH9(_wethAddress);
		require(weth.balanceOf(address(this)) >= tokenAmount, "WETHHandler: not enough weth balance");
		weth.withdraw(tokenAmount);
	}
}
